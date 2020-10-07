/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

import express from 'express';
import helmet from 'helmet';
import path from 'path';
import http from 'http';
import https from 'https';
import url from 'url';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import { helper } from './common/helper';
import appconfig from './appconfig.json';

import { Explorer } from './Explorer';
import { ExplorerError } from './common/ExplorerError';

const logger = helper.getLogger('main');

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
	 * @param {*} bServer
	 * @memberof Broadcaster
	 */
	constructor(bServer: any) {
		super({
			server: bServer
		});
		this.on('connection', function connection(ws, req) {
			const location = url.parse(req.url, true);
			this.on('message', message => {
				logger.info('received: %s, %s', location, message);
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
	logger.debug(sslEnabled, sslCertsPath, sslPath);

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
	explorer
		.getApp()
		.use(express.static(path.join(__dirname, '..', 'client/build')));

	// ============= start server =======================
	server.listen(port, () => {
		logger.info(
			`Please open web browser to access ：${protocol}://${host}:${port}/`
		);
		logger.info(`pid is ${process.pid}`);
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
	logger.info('Received kill signal, shutting down gracefully');
	server.close(() => {
		explorer.close();
		logger.info('Closed out connections');
		process.exit(exitCode);
	});

	setTimeout(() => {
		logger.error('Could not close connections in time, forcefully shutting down');
		explorer.close();
		process.exit(1);
	}, 10000);

	connections.forEach(curr => curr.end());
	setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
};

process.on('unhandledRejection', (up: Error) => {
	logger.error(
		'<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>'
	);
	if (up instanceof ExplorerError) {
		logger.error('Error : ', up.message);
	} else {
		logger.error(up);
	}
	setTimeout(() => {
		shutDown(1);
	}, 2000);
});
process.on('uncaughtException', up => {
	logger.error(
		'<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>'
	);
	if (up instanceof ExplorerError) {
		logger.error('Error : ', up.message);
	} else {
		logger.error(up);
	}
	setTimeout(() => {
		shutDown(1);
	}, 2000);
});

// Listen for TERM signal .e.g. kill
process.on('SIGTERM', shutDown);
// Listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutDown);
