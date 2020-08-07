/**
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const fs = require('fs-extra');
const bcrypt = require('bcrypt');

const Proxy = require('./Proxy');
const helper = require('../../common/helper');
const ExplorerError = require('../../common/ExplorerError');

const logger = helper.getLogger('Platform');
const FabricUtils = require('./utils/FabricUtils.js');
const ExplorerListener = require('../../sync/listener/ExplorerListener');

const CRUDService = require('../../persistence/fabric/CRUDService');
const MetricService = require('../../persistence/fabric/MetricService');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;

const config_path = path.resolve(__dirname, './config.json');

const Model = require('../../model/model');
const FabricConfig = require('./FabricConfig');

/**
 *
 *
 * @class Platform
 */
class Platform {
	/**
	 * Creates an instance of Platform.
	 * @param {*} persistence
	 * @param {*} broadcaster
	 * @memberof Platform
	 */
	constructor(persistence, broadcaster) {
		this.persistence = persistence;
		this.broadcaster = broadcaster;
		this.networks = new Map();
		this.proxy = new Proxy(this);
		this.defaultNetwork = null;
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

		// Setting organization enrolment files
		logger.debug('Setting admin organization enrolment files');
		this.network_configs = network_configs;

		for (const network_name in this.network_configs) {
			// this.networks.set(network_name, new Map());
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

			// Create client instance
			logger.debug('Creating client [%s] >> ', client_name, client_configs);

			const signupResult = await this.registerAdmin(
				client_configs.name,
				client_configs.profile
			);
			if (!signupResult) {
				logger.error(`Failed to register admin user : ${network_name}`);
				continue;
			}

			const client = await FabricUtils.createFabricClient(
				client_configs,
				network_name,
				client_name,
				this.persistence
			);
			if (client) {
				// Set client into clients map
				const clientObj = { name: client_name, instance: client };
				this.networks.set(network_name, clientObj);
			}
			//  }
		}
	}

	registerAdmin(networkName, network_profile_path) {
		const configPath = path.resolve(__dirname, network_profile_path);
		const config = new FabricConfig();
		config.initialize(configPath);

		if (!config.getEnableAuthentication()) {
			logger.info('Disabled authentication');
			return true;
		}

		const userName = config.getAdminUser();
		const password = config.getAdminPassword();
		if (!userName || !password) {
			logger.error('Invalid credentials');
			return false;
		}
		const combinedUserName = `${networkName}-${userName}`;

		return Model.User.findOne({
			where: {
				username: combinedUserName
			}
		}).then(user => {
			if (user != null) {
				return true;
			}
			const salt = bcrypt.genSaltSync(10);
			const hashedPassword = bcrypt.hashSync(password, salt);
			const newUser = {
				username: combinedUserName,
				salt: salt,
				password: hashedPassword,
				networkName: networkName,
				roles: 'admin'
			};

			return Model.User.create(newUser)
				.then(() => {
					return true;
				})
				.catch(error => {
					logger.error('Failed to register admin user');
					return false;
				});
		});
	}

	/**
	 *
	 *
	 * @param {*} syncconfig
	 * @memberof Platform
	 */
	initializeListener(syncconfig) {
		/* eslint-disable */
		for (const [network_name, clientObj] of this.networks.entries()) {
			const client_name = clientObj.name;
			const client = clientObj.instance;
			logger.info(
				'initializeListener, client_name, client ',
				client_name,
				client.client_config
			);
			if (this.getClient(network_name).getStatus()) {
				const explorerListener = new ExplorerListener(this, syncconfig);
				explorerListener.initialize([network_name, client_name, '1']);
				explorerListener.send('Successfully send a message to child process');
				this.explorerListeners.push(explorerListener);
			}
		}
		/* eslint-enable */
	}

	/**
	 *
	 *
	 * @memberof Platform
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
	 * @returns
	 * @memberof Platform
	 */
	getNetworks() {
		return this.networks;
	}

	/**
	 *
	 *
	 * @param {*} network_name
	 * @param {*} client_name
	 * @returns
	 * @memberof Platform
	 */
	getClient(network_name) {
		const clientObj = this.networks.get(network_name || this.defaultNetwork);
		return clientObj.instance;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Platform
	 */
	getPersistence() {
		return this.persistence;
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
