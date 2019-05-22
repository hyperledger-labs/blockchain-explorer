/*
 * SPDX-License-Identifier: Apache-2.0
 */
const explorer_const = require('../../common/ExplorerConst').explorer.const;

/**
 *
 *
 * @class ExplorerListener
 */
class ExplorerListener {
	/**
	 * Creates an instance of ExplorerListener.
	 * @param {*} platform
	 * @param {*} syncconfig
	 * @memberof ExplorerListener
	 */
	constructor(platform, syncconfig) {
		this.platform = platform;
		this.syncType = syncconfig.type;
		this.syncListenerHandler = null;
	}

	/**
	 *
	 *
	 * @param {*} args
	 * @memberof ExplorerListener
	 */
	async initialize(args) {
		if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
			const ForkListenerHandler = require('./ForkListenerHandler');
			this.syncListenerHandler = new ForkListenerHandler(this.platform);
		}
		if (this.syncListenerHandler) {
			this.syncListenerHandler.initialize(args);
		}
	}

	/**
	 *
	 *
	 * @param {*} message
	 * @memberof ExplorerListener
	 */
	send(message) {
		if (this.syncListenerHandler) {
			this.syncListenerHandler.send({
				message
			});
		}
	}

	/**
	 *
	 */
	close() {
		if (this.syncListenerHandler) {
			this.syncListenerHandler.close();
		}
	}
}

module.exports = ExplorerListener;
