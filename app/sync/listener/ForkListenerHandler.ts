/*
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { fork } from 'child_process';

/**
 *
 *
 * @class ForkListenerHandler
 */
export class ForkListenerHandler {
	public platform: any;
	public syncProcessor: any;

	/**
	 * Creates an instance of ForkListenerHandler.
	 * @param {*} platform
	 * @memberof ForkListenerHandler
	 */
	constructor(platform) {
		this.platform = platform;
		this.syncProcessor = null;
	}

	/**
	 *
	 *
	 * @param {*} args
	 * @memberof ForkListenerHandler
	 */
	async initialize(args) {
		this.syncProcessor = fork(path.resolve(__dirname, '../../sync.js'), args, {
			env: {
				...process.env,
				// Mark forked process explicitly for logging using TCP server
				FORK: '1'
			}
		});

		this.syncProcessor.on('message', msg => {
			this.platform.getProxy().processSyncMessage(msg);
		});
	}

	/**
	 *
	 * @param {*} message
	 */
	send(message) {
		this.syncProcessor.send({
			message
		});
	}

	/**
	 *
	 *
	 * @memberof ForkListenerHandler
	 */
	close() {
		if (this.syncProcessor) {
			this.syncProcessor.kill('SIGINT');
		}
	}
}
