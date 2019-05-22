/*
 * SPDX-License-Identifier: Apache-2.0
 */

const explorer_const = require('../../common/ExplorerConst').explorer.const;

/**
 *
 *
 * @class ExplorerSender
 */
class ExplorerSender {
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
		if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
			const ForkSenderHandler = require('./ForkSenderHandler');
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
