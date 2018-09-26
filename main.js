/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const appconfig = require('./appconfig.json');
const helper = require('./app/common/helper');

const logger = helper.getLogger('main');
const express = require('express');
const path = require('path');
const Explorer = require('./app/Explorer');
const ExplorerError = require('./app/common/ExplorerError');

const host = process.env.HOST || appconfig.host;
const port = process.env.PORT || appconfig.port;

class Broadcaster extends WebSocket.Server {
  constructor(server) {
    super({ server });
    this.on('connection', function connection(ws, req) {
      const location = url.parse(req.url, true);
      this.on('message', (message) => {
        console.log('received: %s', message);
      });
    });
  }

  broadcast(data) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        logger.debug('Broadcast >> %j', data);
        console.log('Broadcast >> %j', data);
        client.send(JSON.stringify(data));
      }
    });
  }
}

let server;
let explorer;
async function startExplorer() {
  explorer = new Explorer();
  //= =========== web socket ==============//
  server = http.createServer(explorer.getApp());
  const broadcaster = new Broadcaster(server);
  await explorer.initialize(broadcaster);
  explorer.getApp().use(express.static(path.join(__dirname, 'client/build')));
  logger.info(
    'Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging.'
  );
  // ============= start server =======================
  server.listen(port, () => {
    console.log('\n');
    console.log(`Please open web browser to access ：http://${host}:${port}/`);
    console.log('\n');
    console.log(`pid is ${process.pid}`);
    console.log('\n');
  });
}

startExplorer();

let connections = [];
server.on('connection', (connection) => {
  connections.push(connection);
  connection.on(
    'close',
    () => (connections = connections.filter(curr => curr !== connection))
  );
});

// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
const shutDown = function () {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    explorer.close();
    console.log('Closed out connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    explorer.close();
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
};

process.on('unhandledRejection', (up) => {
  console.log(
    '<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>'
  );
  if (up instanceof ExplorerError) {
    console.log('Error : ', up.message);
  } else {
    console.log(up);
  }
  setTimeout(() => {
    shutDown();
  }, 2000);
});
process.on('uncaughtException', (up) => {
  console.log(
    '<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>'
  );
  if (up instanceof ExplorerError) {
    console.log('Error : ', up.message);
  } else {
    console.log(up);
  }
  setTimeout(() => {
    shutDown();
  }, 2000);
});

// listen for TERM signal .e.g. kill
process.on('SIGTERM', shutDown);
// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutDown);
