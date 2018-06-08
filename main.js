/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

var http = require("http");
var url = require("url");
var WebSocket = require("ws");
var Explorer = require("./app/explorer/Explorer.js")

var appconfig = require("./appconfig.json");
var helper=require('./app/helper.js')
var logger = helper.getLogger("main");
var express = require("express");
var path = require("path");

var host = process.env.HOST || appconfig.host;
var port = process.env.PORT || appconfig.port;


// =======================   controller  ===================

/**
Return latest status
GET /api/status/get - > /api/status
curl -i 'http://<host>:<port>/api/status/<channel>'
Response:
{
  "chaincodeCount": 1,
  "txCount": 3,
  "latestBlock": 2,
  "peerCount": 1
}
 *
 */

var explorer = new Explorer();


async function startExplorer() {
  await explorer.initialize();

  explorer.getApp().use(express.static(path.join(__dirname, "client/build")));

  logger.info(
    "Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging."
  );
}

startExplorer();


//============ web socket ==============//
var server = http.createServer(explorer.getApp());
var wss = new WebSocket.Server({ server });
wss.on("connection", function connection(ws, req) {
  const location = url.parse(req.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });
});

function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}


exports.wss = wss;
exports.broadcast = broadcast;
// ============= start server =======================
server.listen(port, function () {
  console.log(`Please open web browser to access ：http://${host}:${port}/`);
});

// this is for the unit testing
//module.exports = app;
