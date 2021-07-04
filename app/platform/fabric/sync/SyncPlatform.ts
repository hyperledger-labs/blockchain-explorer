/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import * as fs from 'fs';
import { helper } from '../../../common/helper';
import { MetricService } from '../../../persistence/fabric/MetricService';
import { CRUDService } from '../../../persistence/fabric/CRUDService';

import { SyncServices } from '../sync/SyncService';
import { FabricEvent } from './FabricEvent';
import { FabricConfig } from '../FabricConfig';
import { ExplorerError } from '../../../common/ExplorerError';
import { explorerError } from '../../../common/ExplorerMessage';
import * as FabricConst from '../utils/FabricConst';
import * as FabricUtils from '../utils/FabricUtils';

const logger = helper.getLogger('SyncPlatform');

const fabric_const = FabricConst.fabric.const;

const config_path = path.resolve(__dirname, '../config.json');

/**
 *
 *
 * @class SyncPlatform
 */
export class SyncPlatform {
	network_id: string;
	network_name: string;
	client: any;
	eventHub: any;
	sender: any;
	persistence: any;
	syncService: any;
	blocksSyncTime: number;
	network_config: Record<string, any>;

	/**
	 * Creates an instance of SyncPlatform.
	 * @param {*} persistence
	 * @param {*} sender
	 * @memberof SyncPlatform
	 */
	constructor(persistence: any, sender: any) {
		this.network_id = null;
		this.network_name = null;
		this.client = null;
		this.eventHub = null;
		this.sender = sender;
		this.persistence = persistence;
		this.syncService = new SyncServices(this, this.persistence);
		this.blocksSyncTime = 60000;
		this.network_config = null;
	}

	/**
	 *
	 *
	 * @param {*} args
	 * @returns
	 * @memberof SyncPlatform
	 */
	async initialize(args: string | any[]) {
		logger.debug(
			'******* Initialization started for child client process ******',
			args
		);

		// Loading the config.json
		const all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
		const network_configs = all_config[fabric_const.NETWORK_CONFIGS];

		if (args.length === 0) {
			// Get the first network and first client
			this.network_id = Object.keys(network_configs)[0];
			this.network_name = network_configs[this.network_id].name;
		} else if (args.length === 1) {
			// Get the first client with respect to the passed network name
			this.network_id = args[0];
			this.network_name = Object.keys(network_configs[this.network_id].clients)[0];
		} else {
			this.network_id = args[0];
			this.network_name = args[1];
		}

		logger.info(explorerError.MESSAGE_1002, this.network_id, this.network_name);

		logger.debug('Blocks synch interval time >> %s', this.blocksSyncTime);

		this.network_config = network_configs[this.network_id];
		const config = new FabricConfig();
		config.initialize(this.network_id, this.network_config);

		this.client = await FabricUtils.createFabricClient(config);
		if (!this.client) {
			throw new ExplorerError(explorerError.ERROR_2011);
		}

		// Updating the client network and other details to DB
		await (async function updateNetworkConfig(sync) {
			logger.info('Updating the client network and other details to DB');
			const res = await sync.syncService.synchNetworkConfigToDB(sync.client);
			if (!res) {
				logger.error('Failed to update network config to DB');
			}
			setTimeout(updateNetworkConfig, 30000, sync);
		})(this);

		// Start event
		this.eventHub = new FabricEvent(this.client, this.syncService);
		await this.eventHub.initialize();

		/*
		 * Setting interval for validating any missing block from the current client ledger
		 * Set blocksSyncTime property in platform config.json in minutes
		 */
		// During initial sync-up phase, disable discovery request
		(function validateMissingBlocks(sync: SyncPlatform, noDiscovery: boolean) {
			sync.isChannelEventHubConnected(noDiscovery);
			setTimeout(validateMissingBlocks, sync.blocksSyncTime, sync, false);
		})(this, true);

		logger.debug(
			'******* Initialization end for child client process %s ******',
			this.network_id
		);
	}

	/**
	 *
	 *
	 * @memberof SyncPlatform
	 */
	async isChannelEventHubConnected(noDiscovery: boolean) {
		for (const channel_name of this.client.getChannels()) {
			// Validate channel event is connected
			const status = this.eventHub.isChannelEventHubConnected(channel_name);
			if (status) {
				await this.syncService.syncBlocks(this.client, channel_name, noDiscovery);
			} else {
				// Channel client is not connected then it will reconnect
				this.eventHub.connectChannelEventHub(channel_name);
			}
		}
	}

	setBlocksSyncTime(blocksSyncTime: number) {
		if (!isNaN(blocksSyncTime)) {
			this.blocksSyncTime = blocksSyncTime * 1000;
		}
	}

	/**
	 *
	 *
	 * @memberof SyncPlatform
	 */
	setPersistenceService() {
		// Setting platform specific CRUDService and MetricService
		this.persistence.setMetricService(
			new MetricService(this.persistence.getPGService())
		);
		this.persistence.setCrudService(
			new CRUDService(this.persistence.getPGService())
		);
	}

	/**
	 *
	 *
	 * @param {*} notify
	 * @memberof SyncPlatform
	 */
	send(notify: any) {
		if (this.sender) {
			this.sender.send(notify);
		}
	}

	/**
	 *
	 *
	 * @memberof SyncPlatform
	 */
	destroy() {
		if (this.eventHub) {
			this.eventHub.disconnectEventHubs();
		}
	}
}
