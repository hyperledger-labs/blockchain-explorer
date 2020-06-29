/*
 * SPDX-License-Identifier: Apache-2.0
 */

const Fabric_Client = require('fabric-client');
const { User } = require('fabric-common');
const path = require('path');
const includes = require('lodash/includes');

const ExplorerError = require('../../common/ExplorerError');
const FabricUtils = require('./utils/FabricUtils.js');
const FabricGateway = require('../../platform/fabric/gateway/FabricGateway');
const FabricConfig = require('../fabric/FabricConfig');
const helper = require('../../common/helper');

const logger = helper.getLogger('FabricClient');

const explorer_mess = require('../../common/ExplorerMessage').explorer;

/**
 *
 *
 * @class FabricClient
 */
class FabricClient {
	/**
	 * Creates an instance of FabricClient.
	 * @param {*} client_name
	 * @memberof FabricClient
	 */
	constructor(network_name, client_name) {
		this.network_name = network_name;
		this.client_name = client_name;
		this.hfc_client = null;
		this.fabricGateway = null;
		this.defaultMspId = {};
		this.defaultOrderer = null;
		this.channelsGenHash = new Map();
		this.client_config = null;
		this.config = null;
		this.status = false;
		this.tls = false;
		this.asLocalhost = false;
		this.channels = [];
	}

	/**
	 *
	 *
	 * @param {*} client_config
	 * @param {*} persistence
	 * @memberof FabricClient
	 */
	async initialize(client_config, persistence) {
		this.client_config = client_config;

		// Before initializing a channel

		// Loading client from network configuration file
		logger.debug(
			'Client configuration [%s]  ...',
			this.client_name,
			' this.client_config ',
			this.client_config
		);

		const profileConnection = this.client_config.profile;
		const configPath = path.resolve(__dirname, profileConnection);
		try {
			// Use Gateway to connect to fabric network
			this.fabricGateway = new FabricGateway(configPath);
			await this.fabricGateway.initialize();
			this.hfc_client = Fabric_Client.loadFromConfig(this.fabricGateway.config);
			/* eslint-enable */
			this.defaultMspId = this.fabricGateway.getDefaultMspId();
			this.tls = this.fabricGateway.getTls();
			this.config = this.fabricGateway.getConfig();
			// Set discovery protocol
			if (!this.tls) {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpc');
			} else {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpcs');
			}
		} catch (error) {
			// TODO in case of the failure, should terminate explorer?
			logger.error(error);
		}

		// Getting channels from queryChannels
		let channels;
		try {
			// logger.debug('this.defaultPeer ', this.defaultPeer);
			channels = await this.fabricGateway.queryChannels();
		} catch (e) {
			logger.error(e);
		}

		if (channels) {
			this.status = true;
			logger.debug('Client channels >> %j', channels.channels);
			// Initialize channel network information from Discover
			for (const channel of channels.channels) {
				logger.debug('Initializing channel ', channel.channel_id);
				try {
					await this.initializeNewChannel(channel.channel_id);
					logger.debug('Initialized channel >> %s', channel.channel_id);
				} catch (error) {
					logger.error('Failed to initialize new channel: ', channel.channel_id);
				}
			}
		} else if (persistence) {
			logger.info('********* call to initializeDetachClient **********');
			this.initializeDetachClient(this.client_config, persistence);
		} else {
			logger.error('Not found any channels');
		}
	}

	/**
	 *
	 *
	 * @param {*} client_config
	 * @param {*} persistence
	 * @memberof FabricClient
	 */
	async initializeDetachClient(client_config, persistence) {
		const name = client_config.name;
		logger.debug(
			'initializeDetachClient --> client_config ',
			client_config,
			' name ',
			name
		);
		const profileConnection = client_config.profile;
		const configPath = path.resolve(__dirname, profileConnection);
		const fabricConfig = new FabricConfig();
		fabricConfig.initialize(configPath);
		const config = fabricConfig.getConfig();
		this.userName = fabricConfig.getAdminUser();
		const peers = fabricConfig.getPeersConfig();

		logger.info('initializeDetachClient, network config) ', config);
		logger.info(
			'************************************* initializeDetachClient *************************************************'
		);
		logger.info('Error :', explorer_mess.error.ERROR_1009);
		logger.info('Info : ', explorer_mess.message.MESSAGE_1001);
		logger.info(
			'************************************** initializeDetachClient ************************************************'
		);
		const channels = await persistence
			.getCrudService()
			.getChannelsInfo(this.network_name);

		if (channels.length === 0) {
			throw new ExplorerError(explorer_mess.error.ERROR_2003);
		}

		for (const channel of channels) {
			this.setChannelGenHash(channel.channelname, channel.channel_genesis_hash);
			const nodes = await persistence
				.getMetricService()
				.getPeerList(this.network_name, channel.channel_genesis_hash);
			let newchannel;
			try {
				newchannel = this.hfc_client.getChannel(channel.channelname);
			} catch (e) {
				logger.error('Failed to get channel from client ', e);
			}
			if (newchannel === undefined) {
				newchannel = this.hfc_client.newChannel(channel.channelname);
			}
			for (const node of nodes) {
				const peer_config = peers[node.server_hostname];
				let pem;
				try {
					if (peer_config && peer_config.tlsCACerts) {
						pem = FabricUtils.getPEMfromConfig(peer_config.tlsCACerts);
						const msps = {
							[node.mspid]: {
								tls_root_certs: pem
							}
						};
						logger.debug('msps ', msps);
					}
				} catch (e) {
					logger.error(e);
				}
			}
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @memberof FabricClient
	 */
	async initializeNewChannel(channel_name) {
		// Get genesis block for the channel
		const block = await this.getGenesisBlock(channel_name);
		logger.debug('Genesis Block for client [%s] >> %j', this.client_name, block);

		const channel_genesis_hash = await FabricUtils.generateBlockHash(
			block.header
		);
		// Setting channel_genesis_hash to map
		this.setChannelGenHash(channel_name, channel_genesis_hash);
		this.addChannel(channel_name);
		logger.debug(
			`Channel genesis hash for channel [${channel_name}] >> ${channel_genesis_hash}`
		);
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @returns
	 * @memberof FabricClient
	 */
	async initializeChannelFromDiscover(channel_name) {
		logger.debug('initializeChannelFromDiscover ', channel_name);
		if (!includes(this.getChannels(), channel_name)) {
			await this.initializeNewChannel(channel_name);
		}

		if (!this.tls) {
			this.hfc_client.setConfigSetting('discovery-protocol', 'grpc');
		} else {
			this.hfc_client.setConfigSetting('discovery-protocol', 'grpcs');
		}

		const discover_results = await this.fabricGateway.getDiscoveryResult(
			channel_name
		);
		logger.debug(
			`Discover results for channel [${channel_name}] >>`,
			discover_results
		);

		if ('peers_by_org' in discover_results) {
			for (const org in discover_results.peers_by_org) {
				logger.info('Discovered', org, discover_results.peers_by_org[org].peers);
			}
		}

		return discover_results;
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @param {*} url
	 * @param {*} msp_id
	 * @param {*} host
	 * @param {*} msps
	 * @returns
	 * @memberof FabricClient
	 */
	newOrderer(channel, url, msp_id, host, msps) {
		let newOrderer = null;
		channel._orderers.forEach(orderer => {
			if (orderer.getUrl() === url) {
				logger.debug('Found existing orderer %s', url);
				newOrderer = orderer;
			}
		});
		if (!newOrderer) {
			if (msps[msp_id]) {
				logger.debug('Create a new orderer %s', url);
				newOrderer = this.hfc_client.newOrderer(
					url,
					channel._buildOptions(url, url, host, msps[msp_id])
				);
				channel.addOrderer(newOrderer);
			} else {
				throw new ExplorerError(explorer_mess.error.ERROR_2007);
			}
		}
		return newOrderer;
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @param {*} url
	 * @param {*} msp_id
	 * @param {*} host
	 * @param {*} msps
	 * @returns
	 * @memberof FabricClient
	 */
	newPeer(channel, url, msp_id, host, msps) {
		let newpeer = null;
		channel._channel_peers.forEach(peer => {
			if (peer.getUrl() === url) {
				logger.debug('Found existing peer %s', url);
				newpeer = peer;
			}
		});
		if (!newpeer) {
			if (msps[msp_id]) {
				logger.debug('Create a new peer %s', url);
				newpeer = this.hfc_client.newPeer(
					url,
					channel._buildOptions(url, url, host, msps[msp_id])
				);
				channel.addPeer(newpeer, msp_id);
			} else {
				throw new ExplorerError(explorer_mess.error.ERROR_2007);
			}
		}
		return newpeer;
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @returns
	 * @memberof FabricClient
	 */
	async getGenesisBlock(channel) {
		const genesisBlock = await this.fabricGateway.queryBlock(channel, 0);
		if (!genesisBlock) {
			logger.error('Failed to get genesis block');
			return null;
		}
		return genesisBlock;
	}

	/**
	 *
	 *
	 * @param {*} msp_name
	 * @param {*} username
	 * @param {*} msp_admin_cert
	 * @returns
	 * @memberof FabricClient
	 */
	async newUser(msp_name, username, msp_admin_cert) {
		const organization = await this.hfc_client._network_config.getOrganization(
			msp_name,
			true
		);
		if (!organization) {
			logger.debug('Client.createUser missing required organization.');
			return;
		}
		const mspid = organization.getMspid();
		if (!mspid || mspid.length < 1) {
			logger.debug('Client.createUser parameter mspid is required.');
			return;
		}
		const admin_key = organization.getAdminPrivateKey();
		let admin_cert = organization.getAdminCert();
		if (!admin_cert) {
			admin_cert = msp_admin_cert;
		}
		if (!admin_key) {
			logger.debug(
				'Client.createUser one of  cryptoContent privateKey, privateKeyPEM or privateKeyObj is required.'
			);
			return;
		}
		if (!admin_cert) {
			logger.debug(
				'Client.createUser either  cryptoContent signedCert or signedCertPEM is required.'
			);
			return;
		}

		const opts = {
			username,
			mspid,
			cryptoContent: {
				privateKeyPEM: admin_key,
				signedCertPEM: admin_cert
			}
		};
		let importedKey;
		const user = new User(opts.username);
		const privateKeyPEM = opts.cryptoContent.privateKeyPEM;
		if (privateKeyPEM) {
			logger.debug('then privateKeyPEM data');
			importedKey = await this.hfc_client
				.getCryptoSuite()
				.importKey(privateKeyPEM.toString(), {
					ephemeral: !this.hfc_client.getCryptoSuite()._cryptoKeyStore
				});
		}
		const signedCertPEM = opts.cryptoContent.signedCertPEM;
		logger.debug('then signedCertPEM data');
		user.setCryptoSuite(this.hfc_client.getCryptoSuite());
		await user.setEnrollment(importedKey, signedCertPEM.toString(), opts.mspid);
		logger.debug('then user');
		return user;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getChannelNames() {
		return Array.from(this.channelsGenHash.keys());
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getHFC_Client() {
		return this.hfc_client;
	}

	/**
	 *
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getChannels() {
		return this.channels; // Return Array
	}

	/**
	 *
	 *
	 * @param {*} channelName
	 * @memberof FabricClient
	 */
	addChannel(channelName) {
		this.channels.push(channelName);
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @returns
	 * @memberof FabricClient
	 */
	getChannelGenHash(channel_name) {
		return this.channelsGenHash.get(channel_name);
	}

	/**
	 *
	 *
	 * @param {*} name
	 * @param {*} channel_genesis_hash
	 * @memberof FabricClient
	 */
	setChannelGenHash(name, channel_genesis_hash) {
		this.channelsGenHash.set(name, channel_genesis_hash);
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getClientName() {
		return this.client_name;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof FabricClient
	 */
	getChannelByHash(channel_genesis_hash) {
		for (const [channel_name, hash_name] of this.channelsGenHash.entries()) {
			if (channel_genesis_hash === hash_name) {
				return this.hfc_client.getChannel(channel_name);
			}
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof FabricClient
	 */
	getChannelNameByHash(channel_genesis_hash) {
		for (const [channel_name, hash_name] of this.channelsGenHash.entries()) {
			if (channel_genesis_hash === hash_name) {
				return channel_name;
			}
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @returns
	 * @memberof FabricClient
	 */
	getChannel(channel_name) {
		return this.hfc_client.getChannel(channel_name);
	}

	/**
	 *
	 *
	 * @param {*} defaultOrderer
	 * @memberof FabricClient
	 */
	setDefaultOrderer(defaultOrderer) {
		logger.info('Set default orderer : ' + defaultOrderer.getName());
		this.defaultOrderer = defaultOrderer;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getDefaultMspId() {
		return this.defaultMspId;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getStatus() {
		return this.status;
	}
}

module.exports = FabricClient;
