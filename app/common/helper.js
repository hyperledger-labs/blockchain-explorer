/*
 *SPDX-License-Identifier: Apache-2.0
 */

/*
 * Copyright ONECHAIN 2017 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const log4js = require('log4js/lib/log4js');

const path = require('path');
const fs = require('fs-extra');

exports.getLogger = getLogger;
exports.readAllFiles = readAllFiles;

/**
 * Read files from a directory
 *
 * @param {*} dir
 * @returns
 */
function readAllFiles(dir) {
	const files = fs.readdirSync(dir);
	const certs = [];
	files.forEach(file_name => {
		const file_path = path.join(dir, file_name);
		const data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}

/*
 * Please assign the logger with the file name for the application logging and assign the logger with "PgService"
 * for database logging for any file name. Please find an example below.
 *
 * To stacktrace, please pass the error.stack object to the logger. If there is no error.stack object pass in a
 * string with description.
 *
 * const helper = require("./app/helper");
 * const logger = helper.getLogger("main");
 * logger.setLevel('INFO');
 */

/**
 *
 * Returns Logger
 * @param {*} moduleName
 * @returns
 */
function getLogger(moduleName) {
	const logger = log4js.getLogger(moduleName);

	let appLog = 'logs/app/app.log';
	let dbLog = 'logs/db/db.log';
	let consoleLog = 'logs/console/console.log';

	if (process.env.SYNC_LOG_PATH) {
		appLog = `${process.env.SYNC_LOG_PATH}/app/app.log`;
		dbLog = `${process.env.SYNC_LOG_PATH}/db/db.log`;
		consoleLog = `${process.env.SYNC_LOG_PATH}/console/console.log`;
	}

	log4js.configure({
		appenders: {
			app: {
				type: 'dateFile',
				filename: appLog,
				daysToKeep: 7
			},
			db: {
				type: 'dateFile',
				filename: dbLog,
				daysToKeep: 7
			},
			console: {
				type: 'dateFile',
				filename: consoleLog,
				daysToKeep: 7
			},
			consoleFilter: {
				type: 'logLevelFilter',
				appender: 'console',
				level: 'info'
			}
		},
		categories: {
			default: { appenders: ['consoleFilter', 'app'], level: 'debug' },
			PgService: { appenders: ['consoleFilter', 'db'], level: 'debug' }
		}
	});

	return logger;
}

exports.getLogger = getLogger;
exports.readAllFiles = readAllFiles;
