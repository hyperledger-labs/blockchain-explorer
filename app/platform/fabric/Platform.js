/**
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const fs = require('fs-extra');

const Proxy = require('./Proxy');
const helper = require('../../common/helper');
const ExplorerError = require('../../common/ExplorerError');

const logger = helper.getLogger('Platform');
const FabricUtils = require('./utils/FabricUtils.js');
const ExplorerListener = require('../../sync/listener/ExplorerListener');

const PersistenceFactory = require('../../persistence/PersistenceFactory');
const CRUDService = require('../../persistence/fabric/CRUDService');
const MetricService = require('../../persistence/fabric/MetricService');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;

const config_path = path.resolve(__dirname, './config.json');

/**
 *
 *
 * @class Platform
 */
class Platform {
	/**
	 * Creates an instance of Platform.
	 * @param {*} persistenceStore
	 * @param {*} persistenceConfig
	 * @param {*} broadcaster
	 * @memberof Platform
	 */
	constructor(persistenceStore, persistenceConfig, broadcaster) {
		this.persistenceStore = persistenceStore;
		this.persistenceConfig = persistenceConfig;
		this.broadcaster = broadcaster;
		this.networks = new Map();
		this.proxy = new Proxy(this);
		this.defaultNetwork = null;
		this.defaultClient = null;
		this.network_configs = null;
		this.syncType = null;
		this.explorerListeners = [];
	}

	/**
	 *
	 *
	 * @memberof Platform
	 */
	async initialize() {
		/* eslint-disable */
		const _self = this;
		/* eslint-enable */

		// Loading the config.json
		const all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
		const network_configs = all_config[fabric_const.NETWORK_CONFIGS];
		this.syncType = all_config.syncType;

		// Build client context
		logger.debug(
			'******* Initialization started for hyperledger fabric platform ******'
		);
		logger.debug(
			'******* Initialization started for hyperledger fabric platform ******,',
			network_configs
		);
		await this.buildClients(network_configs);

		if (
			this.networks.size === 0 &&
			this.networks.get(this.defaultNetwork).size === 0
		) {
			logger.error(
				'************* There is no client found for Hyperledger fabric platform *************'
			);
			throw new ExplorerError(explorer_error.ERROR_2008);
		}
	}

	/**
	 *
	 *
	 * @param {*} network_configs
	 * @memberof Platform
	 */
	async buildClients(network_configs) {
		/* eslint-disable */
		const _self = this;
		/* eslint-enable */
		let clientstatus = true;

		// Setting organization enrolment files
		logger.debug('Setting admin organization enrolment files');
		try {
			this.network_configs = await FabricUtils.setAdminEnrolmentPath(
				network_configs
			);
		} catch (e) {
			logger.error(e);
			clientstatus = false;
			this.network_configs = network_configs;
		}

		for (const network_name in this.network_configs) {
			this.networks.set(network_name, new Map());
			const client_configs = this.network_configs[network_name];
			// Console.log('network_name ', network_name, ' client_configs ', client_configs)
			if (!this.defaultNetwork) {
				this.defaultNetwork = network_name;
			}

			/*
			 * Create fabric explorer client for each
			 * Each client is connected to only a single peer and monitor that particular peer only
			 */
			logger.info(
				' client_configs.name ',
				client_configs.name,
				' client_configs.profile ',
				client_configs.profile
			);
			const client_name = client_configs.name;
			// Set default client as first client
			if (!this.defaultClient) {
				this.defaultClient = client_name;
			}

			// Create client instance
			logger.debug('Creating persistence', network_name);

			this.persistenceConfig.networkName = network_name;
			logger.debug(network_name, this.persistenceConfig);
			const persistence = await PersistenceFactory.create(
				this.persistenceStore,
				this.persistenceConfig
			);
			if (!persistence) {
				logger.error('Failed to create persistence for', network_name);
				this.networks.delete(network_name);
				continue;
			}

			// Setting platform specific CRUDService and MetricService
			this.setPersistenceService(persistence);

			// Create client instance
			logger.debug('Creating client [%s] >> ', client_configs, client_name);

			let client;

			if (clientstatus) {
				logger.info('FabricUtils.createFabricClient ');
				client = await FabricUtils.createFabricClient(
					client_configs,
					client_name,
					persistence
				);
			} else {
				logger.info('FabricUtils.createDetachClient ');
				client = await FabricUtils.createDetachClient(
					client_configs,
					client_name,
					persistence
				);
			}
			if (client) {
				// Set client into clients map
				logger.info('FabricUtils.createDetachClient ');
				const clients = this.networks.get(network_name);
				clients.set(client_name, { client: client, persistence: persistence });
			}
			//  }
		}
	}

	/**
	 *
	 *
	 * @param {*} syncconfig
	 * @memberof Platform
	 */
	async initializeListener(syncconfig) {
		/* eslint-disable */
		for (const [network_name, clients] of this.networks.entries()) {
			for (const [client_name, clientObj] of clients.entries()) {
				let client = clientObj.client;
				logger.info(
					'initializeListener, client_name, client ',
					client_name,
					client.client_config
				);
				if (this.getClient(network_name, client_name).getStatus()) {
					const explorerListener = new ExplorerListener(this, syncconfig);
					explorerListener.initialize([network_name, client_name, '1']);
					explorerListener.send('Successfully send a message to child process');
					this.explorerListeners.push(explorerListener);
				}
			}
		}
		/* eslint-enable */
	}

	/**
	 *
	 *
	 * @memberof Platform
	 */
	setPersistenceService(persistence) {
		// Setting platform specific CRUDService and MetricService
		persistence.setMetricService(new MetricService(persistence.getPGService()));
		persistence.setCrudService(new CRUDService(persistence.getPGService()));
	}

	/**
	 *
	 *
	 * @param {*} network_name
	 * @param {*} client_name
	 * @param {*} channel_name
	 * @returns
	 * @memberof Platform
	 */
	changeNetwork(network_name, client_name, channel_name) {
		const network = this.networks.get(network_name);
		if (network) {
			this.defaultNetwork = network_name;
			let client;
			if (client_name) {
				client = network.get(client_name).client;
				if (client) {
					this.defaultClient = client_name;
				} else {
					return `Client [${network_name}] is not found in network`;
				}
			} else {
				const iterator = network.values();
				client = iterator.next().value;
				if (!client) {
					return `Client [${network_name}] is not found in network`;
				}
			}
			if (channel_name) {
				client.setDefaultChannel(channel_name);
			}
		} else {
			return `Network [${network_name}] is not found`;
		}
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Platform
	 */
	getNetworks() {
		return this.networks;
	}

	/**
	 *
	 *
	 * @param {*} networkName
	 * @returns
	 * @memberof Platform
	 */
	getClient(networkName) {
		return this.networks
			.get(networkName || this.defaultNetwork)
			.entries()
			.next().value[1].client;
	}

	/**
	 *
	 *
	 * @param {*} networkName
	 * @returns
	 * @memberof Platform
	 */
	getPersistence(networkName) {
		return this.networks
			.get(networkName || this.defaultNetwork)
			.entries()
			.next().value[1].persistence;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Platform
	 */
	getBroadcaster() {
		return this.broadcaster;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Platform
	 */
	getProxy() {
		return this.proxy;
	}

	/**
	 *
	 *
	 * @param {*} defaultClient
	 * @memberof Platform
	 */
	setDefaultClient(defaultClient) {
		this.defaultClient = defaultClient;
	}

	/**
	 *
	 *
	 * @memberof Platform
	 */
	async destroy() {
		logger.info(
			'<<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>'
		);
		for (const explorerListener of this.explorerListeners) {
			explorerListener.close();
		}
	}
}
module.exports = Platform;
