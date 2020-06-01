/*
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const fs = require('fs-extra');

const SyncService = require('../sync/SyncService');
const FabricUtils = require('../utils/FabricUtils');
const FabricEvent = require('./FabricEvent');

const helper = require('../../../common/helper');

const logger = helper.getLogger('SyncPlatform');
const ExplorerError = require('../../../common/ExplorerError');

const CRUDService = require('../../../persistence/fabric/CRUDService');
const MetricService = require('../../../persistence/fabric/MetricService');

const fabric_const = require('../utils/FabricConst').fabric.const;
const explorer_mess = require('../../../common/ExplorerMessage').explorer;

const config_path = path.resolve(__dirname, '../config.json');

/**
 *
 *
 * @class SyncPlatform
 */
class SyncPlatform {
	/**
	 * Creates an instance of SyncPlatform.
	 * @param {*} persistence
	 * @param {*} sender
	 * @memberof SyncPlatform
	 */
	constructor(persistence, sender) {
		this.network_name = null;
		this.client_name = null;
		this.client = null;
		this.eventHub = null;
		this.sender = sender;
		this.persistence = persistence;
		this.syncService = new SyncService(this, this.persistence);
		this.blocksSyncTime = 60000;
		this.client_configs = null;
	}

	/**
	 *
	 *
	 * @param {*} args
	 * @returns
	 * @memberof SyncPlatform
	 */
	async initialize(args) {
		const _self = this;

		logger.debug(
			'******* Initialization started for child client process %s ******',
			this.client_name
		);

		// Loading the config.json
		const all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
		const network_configs = all_config[fabric_const.NETWORK_CONFIGS];

		if (args.length === 0) {
			// Get the first network and first client
			this.network_name = Object.keys(network_configs)[0];
			this.client_name = network_configs[this.network_name].name;
		} else if (args.length === 1) {
			// Get the first client with respect to the passed network name
			this.network_name = args[0];
			this.client_name = Object.keys(
				network_configs[this.network_name].clients
			)[0];
		} else {
			this.network_name = args[0];
			this.client_name = args[1];
		}

		logger.info(
			explorer_mess.message.MESSAGE_1002,
			this.network_name,
			this.client_name
		);

		logger.debug('Blocks synch interval time >> %s', this.blocksSyncTime);

		// Update the discovery-cache-life as block synch interval time in global config
		global.hfc.config.set('discovery-cache-life', this.blocksSyncTime);
		// global.hfc.config.set('initialize-with-discovery', true);

		this.client_configs = network_configs[this.network_name];

		this.client = await FabricUtils.createFabricClient(
			this.client_configs,
			this.network_name,
			this.client_name
		);
		if (!this.client) {
			throw new ExplorerError(explorer_mess.error.ERROR_2011);
		}

		this.client.network_name = this.network_name;

		// Updating the client network and other details to DB
		const res = await this.syncService.synchNetworkConfigToDB(this.client);
		if (!res) {
			return;
		}

		setInterval(() => {
			logger.info('Updating the client network and other details to DB');
			this.syncService.synchNetworkConfigToDB(this.client);
		}, 30000);

		// Start event
		this.eventHub = new FabricEvent(this.client, this.syncService);
		await this.eventHub.initialize();

		/*
		 * Setting interval for validating any missing block from the current client ledger
		 * Set blocksSyncTime property in platform config.json in minutes
		 */
		setInterval(() => {
			_self.isChannelEventHubConnected();
		}, this.blocksSyncTime);
		logger.debug(
			'******* Initialization end for child client process %s ******',
			this.client_name
		);
	}

	/**
	 *
	 *
	 * @memberof SyncPlatform
	 */
	async isChannelEventHubConnected() {
		for (const channel_name of this.client.getChannels()) {
			// Validate channel event is connected
			const status = this.eventHub.isChannelEventHubConnected(channel_name);
			if (status) {
				await this.syncService.synchBlocks(this.client, channel_name);
			} else {
				// Channel client is not connected then it will reconnect
				this.eventHub.connectChannelEventHub(channel_name);
			}
		}
	}

	setBlocksSyncTime(blocksSyncTime) {
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
	send(notify) {
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

module.exports = SyncPlatform;
