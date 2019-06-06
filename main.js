/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const WebSocket = require('ws');
const appconfig = require('./appconfig.json');
const helper = require('./app/common/helper');

const logger = helper.getLogger('main');

const Explorer = require('./app/Explorer');
const ExplorerError = require('./app/common/ExplorerError');

const sslEnabled = process.env.SSL_ENABLED || appconfig.sslEnabled;
const sslCertsPath = process.env.SSL_CERTS_PATH || appconfig.sslCertsPath;
const host = process.env.HOST || appconfig.host;
const port = process.env.PORT || appconfig.port;
const protocol = sslEnabled ? 'https' : 'http';

/**
 *
 *
 * @class Broadcaster
 * @extends {WebSocket.Server}
 */
class Broadcaster extends WebSocket.Server {
	/**
	 * Creates an instance of Broadcaster.
	 * @param {*} server
	 * @memberof Broadcaster
	 */
	constructor(server) {
		super({
			server
		});
		this.on('connection', function connection(ws, req) {
			const location = url.parse(req.url, true);
			this.on('message', message => {
				console.log('received: %s, %s', location, message);
			});
		});
	}

	/**
	 *
	 *
	 * @param {*} data
	 * @memberof Broadcaster
	 */
	broadcast(data) {
		this.clients.forEach(client => {
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

	// Application headers
	explorer.getApp().use(helmet());

	explorer.getApp().use(helmet.xssFilter());
	explorer.getApp().use(helmet.hidePoweredBy());
	explorer.getApp().use(helmet.referrerPolicy());
	explorer.getApp().use(helmet.noSniff());
	/* eslint-disable */
	explorer.getApp().use(helmet.frameguard({ action: 'SAMEORIGIN' }));
	explorer.getApp().use(
		helmet.contentSecurityPolicy({
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				objectSrc: ["'self'"],
				frameSrc: ["'self'"],
				fontSrc: ["'self'"],
				imgSrc: ["'self' data: https:; "]
			}
		})
	);
	/* eslint-enable */
	// Application headers

	// = =========== web socket ==============//
	const sslPath = path.join(__dirname, sslCertsPath);
	console.debug(sslEnabled, sslCertsPath, sslPath);

	if (sslEnabled) {
		const options = {
			key: fs.readFileSync(sslPath + '/privatekey.pem').toString(),
			cert: fs.readFileSync(sslPath + '/certificate.pem').toString()
		};
		server = https.createServer(options, explorer.getApp());
	} else {
		server = http.createServer(explorer.getApp());
	}
	const broadcaster = new Broadcaster(server);
	await explorer.initialize(broadcaster);
	explorer.getApp().use(express.static(path.join(__dirname, 'client/build')));
	logger.info(
		'Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging.'
	);
	// ============= start server =======================
	server.listen(port, () => {
		console.log('\n');
		console.log(
			`Please open web browser to access ：${protocol}://${host}:${port}/`
		);
		console.log('\n');
		console.log(`pid is ${process.pid}`);
		console.log('\n');
	});
}

startExplorer();
/* eslint-disable */
let connections = [];
server.on('connection', connection => {
	connections.push(connection);
	connection.on(
		'close',
		() => (connections = connections.filter(curr => curr !== connection))
	);
});
/* eslint-enable */
/*
 * This function is called when you want the server to die gracefully
 * i.e. wait for existing connections
 */

const shutDown = function(exitCode) {
	console.log('Received kill signal, shutting down gracefully');
	server.close(() => {
		explorer.close();
		console.log('Closed out connections');
		process.exit(exitCode);
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

process.on('unhandledRejection', up => {
	console.log('<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>');
	if (up instanceof ExplorerError) {
		console.log('Error : ', up.message);
	} else {
		console.log(up);
	}
	setTimeout(() => {
		shutDown(1);
	}, 2000);
});
process.on('uncaughtException', up => {
	console.log('<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>');
	if (up instanceof ExplorerError) {
		console.log('Error : ', up.message);
	} else {
		console.log(up);
	}
	setTimeout(() => {
		shutDown(1);
	}, 2000);
});

// Listen for TERM signal .e.g. kill
process.on('SIGTERM', shutDown);
// Listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutDown);
