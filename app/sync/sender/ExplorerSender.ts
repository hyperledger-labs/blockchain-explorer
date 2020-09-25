/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { explorerConst } from '../../common/ExplorerConst';
import { ForkSenderHandler } from './ForkSenderHandler';

/**
 *
 *
 * @class ExplorerSender
 */
export class ExplorerSender {
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
		if (this.syncType && this.syncType === explorerConst.SYNC_TYPE_LOCAL) {
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
