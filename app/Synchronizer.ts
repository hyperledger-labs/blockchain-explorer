/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable import/extensions */
import { helper } from './common/helper';
import { explorerConst } from './common/ExplorerConst';
import { explorerError } from './common/ExplorerMessage';
import { ExplorerError } from './common/ExplorerError';
import syncconfig from './explorerconfig.json';
import { SyncBuilder } from './sync/SyncBuilder';
import { PersistenceFactory } from './persistence/PersistenceFactory';
import { ExplorerSender } from './sync/sender/ExplorerSender';
/* eslint-enable import/extensions */
const logger = helper.getLogger('Synchronizer');

/**
 *
 *
 * @class Synchronizer
 */
export class Synchronizer {
	args: any;
	persistence: any;
	platform: any;
	/**
	 * Creates an instance of Synchronizer.
	 * @param {*} args
	 * @memberof Synchronizer
	 */
	constructor(args: any) {
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
