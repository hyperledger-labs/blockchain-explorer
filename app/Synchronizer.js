/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable import/extensions */
import { helper } from './common/helper';

import { explorerConst } from './common/ExplorerConst';
import { explorerError } from './common/ExplorerMessage';
/* eslint-enable import/extensions */

const syncconfig = require('./explorerconfig.json');
const ExplorerError = require('./common/ExplorerError');

const logger = helper.getLogger('Synchronizer');
const SyncBuilder = require('./sync/SyncBuilder');
const PersistenceFactory = require('./persistence/PersistenceFactory');
const ExplorerSender = require('./sync/sender/ExplorerSender');

/**
 *
 *
 * @class Synchronizer
 */
class Synchronizer {
	/**
	 * Creates an instance of Synchronizer.
	 * @param {*} args
	 * @memberof Synchronizer
	 */
	constructor(args) {
		this.args = args;
		this.persistence = null;
		this.platform = null;
	}

	/**
	 *
	 *
	 * @memberof Synchronizer
	 */
	async initialize() {
		if (!syncconfig[explorerConst.PERSISTENCE]) {
			throw new ExplorerError(explorerError.ERROR_1001);
		}
		if (!syncconfig[syncconfig[explorerConst.PERSISTENCE]]) {
			throw new ExplorerError(
				explorerError.ERROR_1002,
				syncconfig[explorerConst.PERSISTENCE]
			);
		}

		let pltfrm;
		if (syncconfig && syncconfig.sync && syncconfig.sync.platform) {
			pltfrm = syncconfig.sync.platform;
		} else {
			throw new ExplorerError(explorerError.ERROR_1006);
		}

		this.persistence = await PersistenceFactory.create(
			syncconfig[explorerConst.PERSISTENCE],
			syncconfig[syncconfig[explorerConst.PERSISTENCE]]
		);

		const sender = new ExplorerSender(syncconfig.sync);
		sender.initialize();
		logger.debug(' Synchronizer initialized');
		this.platform = await SyncBuilder.build(pltfrm, this.persistence, sender);

		this.platform.setPersistenceService();

		// For overriding sync interval(min) via environment variable(sec)
		const syncIntervalSec = process.env.EXPLORER_SYNC_BLOCKSYNCTIME_SEC
			? parseInt(process.env.EXPLORER_SYNC_BLOCKSYNCTIME_SEC, 10)
			: parseInt(syncconfig.sync.blocksSyncTime, 10) * 60;
		this.platform.setBlocksSyncTime(syncIntervalSec);
		logger.info('initialize :', syncIntervalSec);

		await this.platform.initialize(this.args);
	}

	/**
	 *
	 *
	 * @memberof Synchronizer
	 */
	close() {
		if (this.persistence) {
			this.persistence.closeconnection();
		}
		if (this.platform) {
			this.platform.destroy();
		}
	}
}

module.exports = Synchronizer;
