/*
 * SPDX-License-Identifier: Apache-2.0
 */

const Fabric_Client = require('fabric-client');
const { BlockDecoder, User } = require('fabric-common');
const path = require('path');

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
		this.defaultPeer = {};
		this.defaultMspId = {};
		this.defaultChannel = {};
		this.defaultOrderer = null;
		this.channelsGenHash = new Map();
		this.client_config = null;
		this.config = null;
		this.status = false;
		this.tls = false;
		this.asLocalhost = false;
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
			const channel_name = this.fabricGateway.getDefaultChannelName();
			this.defaultPeer = this.fabricGateway.getDefaultPeer();
			this.defaultMspId = this.fabricGateway.getDefaultMspId();
			this.defaultChannel = this.hfc_client.getChannel(channel_name);
			this.tls = this.fabricGateway.getTls();
			this.config = this.fabricGateway.getConfig();
			logger.debug(
				'Set client [%s] default channel as  >> %s',
				this.client_name,
				this.defaultChannel.getName()
			);
			// Set discovery protocol
			if (!this.tls) {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpc');
			} else {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpcs');
			}
			this.asLocalhost =
				String(
					this.hfc_client.getConfigSetting('discovery-as-localhost', 'true')
				) === 'true';
			// Enable discover service
			await this.defaultChannel.initialize({
				discover: true,
				target: this.defaultPeer,
				asLocalhost: this.asLocalhost
			});
		} catch (error) {
			// TODO in case of the failure, should terminate explorer?
			logger.error(error);
		}

		// Getting channels from queryChannels
		let channels;
		try {
			logger.debug('this.defaultPeer ', this.defaultPeer);
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

			try {
				// Load default channel network details from discovery
				const result = await this.defaultChannel.getDiscoveryResults();
				logger.debug(
					'Channel Discovery, getDiscoveryResults returned result ',
					result
				);
			} catch (e) {
				logger.debug('Channel Discovery >>  %s', e);
				throw new ExplorerError(
					explorer_mess.error.ERROR_2001,
					this.defaultChannel.getName(),
					this.client_name
				);
			}

			/*
			 * Setting default orderer
			 * The new channel may not be in the configuration, let's use this.defaultChannel.getName()
			 */
			const defaultChannelName = this.defaultChannel.getName();
			const channel = await this.hfc_client.getChannel(defaultChannelName);
			const temp_orderers = await channel.getOrderers();
			if (temp_orderers && temp_orderers.length > 0) {
				this.defaultOrderer = temp_orderers[0];
			} else {
				logger.error(' No orderrers found ', temp_orderers);
				throw new ExplorerError(explorer_mess.error.ERROR_2002);
			}
			logger.debug(
				'Set client [%s] default orderer as  >> %s',
				this.client_name,
				this.defaultOrderer.getName()
			);
		} else if (persistence) {
			logger.info('********* call to initializeDetachClient **********');
			this.initializeDetachClient(this.client_config, persistence);
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
		const defaultPeerConfig = fabricConfig.getDefaultPeerConfig();
		const default_peer_name = defaultPeerConfig.name;
		const channels = await persistence
			.getCrudService()
			.getChannelsInfo(this.network_name, default_peer_name);

		const default_channel_name = fabricConfig.getDefaultChannel();

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

			try {
				newchannel.getPeer(default_peer_name);
			} catch (e) {
				logger.error(
					'Failed to connect to default peer: ',
					default_peer_name,
					' \n',
					e
				);

				/*
				 * Const url = 'grpc://localhost:7051';
				 * const newpeer = this.hfc_client.newPeer(url, {
				 * 'ssl-target-name-override': default_peer_name,
				 * name: default_peer_name
				 * });
				 * newchannel.addPeer(newpeer);
				 *
				 */
			}
		}

		this.defaultChannel = this.hfc_client.getChannel(default_channel_name);
		if (this.defaultChannel.getPeers().length > 0) {
			this.defaultPeer = this.defaultChannel.getPeer(default_peer_name);
		}

		if (this.defaultChannel === undefined) {
			throw new ExplorerError(explorer_mess.error.ERROR_2004);
		}
		if (this.defaultPeer === undefined) {
			throw new ExplorerError(explorer_mess.error.ERROR_2005);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @memberof FabricClient
	 */
	async initializeNewChannel(channel_name) {
		// If the new channel is not defined in configuration, then use default channel configuration as new channel configuration
		if (!this.config.channels[channel_name]) {
			this.hfc_client._network_config._network_config.channels[
				channel_name
			] = this.config.channels[this.defaultChannel.getName()];
		}

		/*
		 * Get channel, if the channel is not exist in the hfc client context,
		 * Then it will create new channel from the network configuration
		 */
		let channel;
		try {
			channel = await this.hfc_client.getChannel(channel_name);
			// Enable discover

			await this.initializeChannelFromDiscover(channel_name);
		} catch (error) {
			logger.error(
				'Failed to initialize Channel From Discover, channel ',
				channel_name
			);
		}
		// Get genesis block for the channel
		const block = await this.getGenesisBlock(channel);
		logger.debug('Genesis Block for client [%s] >> %j', this.client_name, block);

		const channel_genesis_hash = await FabricUtils.generateBlockHash(
			block.header
		);
		// Setting channel_genesis_hash to map
		this.setChannelGenHash(channel_name, channel_genesis_hash);
		logger.debug(
			'Channel genesis hash for channel [%s] >> %s',
			channel_name,
			channel_genesis_hash
		);
		logger.debug(
			'Channel genesis hash for channel [%s] >> %s',
			channel_name,
			channel_genesis_hash
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
		let channel = this.hfc_client.getChannel(channel_name, false);
		if (!channel) {
			await this.initializeNewChannel(channel_name);
			channel = this.getChannel(channel_name);
		}
		if (channel) {
			if (!this.tls) {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpc');
			} else {
				this.hfc_client.setConfigSetting('discovery-protocol', 'grpcs');
			}
			await channel.initialize({
				discover: true,
				target: this.defaultPeer,
				asLocalhost: this.asLocalhost
			});
		}

		const discover_results = await this.getChannelDiscover(channel);
		logger.debug(
			'Discover results for client [%s] >> %j',
			this.client_name,
			discover_results
		);

		// Creating users for admin peers
		if (discover_results) {
			if (discover_results.msps) {
				for (const msp_name in discover_results.msps) {
					const msp = discover_results.msps[msp_name];

					if (!channel._msp_manager.getMSP(msp.id)) {
						const config = {
							rootCerts: msp.rootCerts,
							intermediateCerts: msp.intermediateCerts,
							admins: msp.admins,
							cryptoSuite: channel._clientContext._crytoSuite,
							id: msp.id,
							orgs: msp.orgs,
							tls_root_certs: msp.tls_root_certs,
							tls_intermediate_certs: msp.tls_intermediate_certs
						};
						channel._msp_manager.addMSP(config);
					}
				}
			}
			// Creating orderers
			if (discover_results.orderers) {
				for (const msp_id in discover_results.orderers) {
					const endpoints = discover_results.orderers[msp_id].endpoints;
					for (const endpoint of endpoints) {
						logger.info(' FabricClient.discover_results  endpoint ', endpoint);
						const discoveryProtocol = this.hfc_client.getConfigSetting(
							'discovery-protocol'
						);
						const requesturl =
							`${discoveryProtocol}://${endpoint.host}:` + endpoint.port;
						logger.debug(
							'initializeChannelFromDiscover.discoveryProtocol ',
							discoveryProtocol,
							' requesturl ',
							requesturl
						);

						this.newOrderer(
							channel,
							requesturl,
							msp_id,
							endpoint.host,
							discover_results.msps
						);
						logger.debug(
							'Successfully created orderer [%s:%s] for client [%s]',
							endpoint.host,
							endpoint.port,
							this.client_name
						);
					}
				}
			}

			channel._discovery_results = discover_results;
			return discover_results;
		}
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
	async getChannelDiscover(channel) {
		const discover_request = {
			target: this.defaultPeer,
			config: true
		};
		const discover_results = await channel._discover(discover_request);
		return discover_results;
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @returns
	 * @memberof FabricClient
	 */
	async getGenesisBlock(channel) {
		const orderer = this.getDefaultOrderer();
		let genesisBlock = await this.getGenesisBlockFromOrderer(channel, orderer);
		if (!genesisBlock) {
			if (orderer) {
				this.setOffline(channel, orderer);
			}

			let neworderer = this.switchOrderer(channel);
			while (neworderer != null) {
				this.setDefaultOrderer(neworderer);
				genesisBlock = await this.getGenesisBlockFromOrderer(channel, neworderer);
				if (genesisBlock) {
					logger.info(
						'Succeeded to switch default orderer to ' + neworderer.getName()
					);
					break;
				} else {
					logger.error('Failed to get genesis block with ' + neworderer.getName());
					this.setOffline(channel, neworderer);
					neworderer = this.switchOrderer(channel);
					continue;
				}
			}
		}

		if (genesisBlock) {
			return BlockDecoder.decodeBlock(genesisBlock);
		}

		logger.error('Failed to get genesis block');
		return null;
	}

	async getGenesisBlockFromOrderer(channel, orderer) {
		try {
			const request = {
				orderer: orderer,
				txId: this.getHFC_Client().newTransactionID(true) // Get an admin based transactionID
			};
			const genesisBlock = await channel.getGenesisBlock(request);
			return genesisBlock;
		} catch (error) {
			logger.error(
				'Failed to get genesis block with ' + orderer ? orderer.getName() : 'null'
			);
			return null;
		}
	}

	setOffline(channel, orderer) {
		if (!channel._discovery_results || !channel._discovery_results.orderers) {
			return;
		}
		for (const mspid in channel._discovery_results.orderers) {
			const endpoints = channel._discovery_results.orderers[mspid].endpoints;
			for (let i = 0; i < endpoints.length; i++) {
				const value = endpoints[i];
				if (orderer.getName().split(':')[0] === value.host) {
					logger.debug('Toggle offline : ', value.host);
					channel._discovery_results.orderers[mspid].endpoints[i]._offline = true;
					break;
				}
			}
		}
	}

	switchOrderer(channel) {
		if (!channel._discovery_results || !channel._discovery_results.orderers) {
			return null;
		}
		let neworderer = null;
		for (const mspid in channel._discovery_results.orderers) {
			const endpoints = channel._discovery_results.orderers[mspid].endpoints;
			for (const value of endpoints) {
				if (value._offline === undefined) {
					logger.debug('Switch orderer : ', value.host);
					neworderer = channel.getOrderer(`${value.host}:${value.port}`);
					break;
				}
			}
		}
		return neworderer;
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
	 * @returns
	 * @memberof FabricClient
	 */
	getChannels() {
		return this.hfc_client._channels; // Return Map
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
	getDefaultPeer() {
		return this.defaultPeer;
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
	 * @returns
	 * @memberof FabricClient
	 */
	getDefaultChannel() {
		return this.defaultChannel;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getDefaultOrderer() {
		return this.defaultOrderer;
	}

	/**
	 *
	 *
	 * @param {*} defaultPeer
	 * @memberof FabricClient
	 */
	setDefaultPeer(defaultPeer) {
		this.defaultPeer = defaultPeer;
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
	 * @param {*} channel_name
	 * @memberof FabricClient
	 */
	setDefaultChannel(channel_name) {
		this.defaultChannel = this.hfc_client.getChannel(channel_name);
	}

	/**
	 *
	 *
	 * @param {*} new_channel_genesis_hash
	 * @returns
	 * @memberof FabricClient
	 */
	setDefaultChannelByHash(new_channel_genesis_hash) {
		for (const [
			channel_name,
			channel_genesis_hash
		] of this.channelsGenHash.entries()) {
			if (new_channel_genesis_hash === channel_genesis_hash) {
				this.defaultChannel = this.hfc_client.getChannel(channel_name);
				return channel_genesis_hash;
			}
		}
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
