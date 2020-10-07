/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { helper } from '../../common/helper';

const logger = helper.getLogger('ForkSenderHandler');

/**
 *
 *
 * @class ForkSenderHandler
 */
export class ForkSenderHandler {
	/**
	 * Creates an instance of ForkSenderHandler.
	 * @memberof ForkSenderHandler
	 */
	/*eslint-disable */
	constructor() {}
	/* eslint-enable */

	async initialize() {
		process.on('message', msg => {
			logger.debug('Message from parent: %j', msg);
		});
	}

	/**
	 *
	 *
	 * @param {*} message
	 * @memberof ForkSenderHandler
	 */
	send(message) {
		if (process.send) {
			process.send(message);
		}
	}

	/**
	 *
	 *
	 * @memberof ForkSenderHandler
	 */
	close() {
		// TODO
	}
}
