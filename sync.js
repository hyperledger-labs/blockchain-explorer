/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { helper } from './app/common/helper';

const Synchronizer = require('./app/Synchronizer');

const logger = helper.getLogger('Sync');
const ExplorerError = require('./app/common/ExplorerError');

const args = process.argv.slice(2);

let synchronizer;

async function start() {
	logger.debug('Start synchronizer');
	synchronizer = new Synchronizer(args);
	await synchronizer.initialize();

	logger.info(`Synchronizer pid is ${process.pid}`);
}

start();

/*
 * This function is called when you want the server to die gracefully
 * i.e. wait for existing connections
 */

const shutDown = function() {
	logger.info(
		'<<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>'
	);
	if (synchronizer) {
		synchronizer.close();
	}
	setTimeout(() => {
		process.exit(0);
		setTimeout(() => {
			logger.error(
				'Could not close child connections in time, forcefully shutting down'
			);
			if (synchronizer) {
				synchronizer.close();
			}
			process.exit(1);
		}, 5000);
	}, 2000);
};

process.on('unhandledRejection', up => {
	logger.error(
		'<<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>'
	);
	if (up instanceof ExplorerError) {
		logger.error('Error : ', up.message);
	} else {
		logger.error(up);
	}
	shutDown();
});
process.on('uncaughtException', up => {
	logger.error(
		'<<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>'
	);
	if (up instanceof ExplorerError) {
		logger.error('Error : ', up.message);
	} else {
		logger.error(up);
	}
	shutDown();
});

// Listen for TERM signal .e.g. kill
process.on('SIGTERM', shutDown);
// Listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutDown);
