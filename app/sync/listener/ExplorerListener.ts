/*
 * SPDX-License-Identifier: Apache-2.0
 */
import {explorerConst} from '../../common/ExplorerConst'
const ForkListenerHandler = require('./ForkListenerHandler');

/**
 *
 *
 * @class ExplorerListener
 */
class ExplorerListener {
	public platform: any;
	public syncType: any;
	public syncListenerHandler: any;

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
		if (this.syncType && this.syncType === explorerConst.SYNC_TYPE_LOCAL) {
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
