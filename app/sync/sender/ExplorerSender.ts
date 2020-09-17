/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {explorer} from '../../common/ExplorerConst'
const ForkSenderHandler = require('./ForkSenderHandler');

/**
 *
 *
 * @class ExplorerSender
 */
class ExplorerSender {
	public syncType: any;
	public syncSenderHandler: any;

	/**
	 * Creates an instance of ExplorerSender.
	 * @param {*} syncconfig
	 * @memberof ExplorerSender
	 */
	constructor(syncconfig) {
		this.syncType = syncconfig.type;
		this.syncSenderHandler = null;
	}

	/**
	 *
	 *
	 * @memberof ExplorerSender
	 */
	async initialize() {
		if (this.syncType && this.syncType === explorer.const.SYNC_TYPE_LOCAL) {
			this.syncSenderHandler = new ForkSenderHandler();
		}
		if (this.syncSenderHandler) {
			this.syncSenderHandler.initialize();
		}
	}

	/**
	 *
	 *
	 * @param {*} message
	 * @memberof ExplorerSender
	 */
	send(message) {
		if (this.syncSenderHandler) {
			this.syncSenderHandler.send(message);
		}
	}
}

module.exports = ExplorerSender;
