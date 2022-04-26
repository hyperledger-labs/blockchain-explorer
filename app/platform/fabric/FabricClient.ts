/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { includes } from 'lodash';
import { helper } from '../../common/helper';
import { ExplorerError } from '../../common/ExplorerError';
import { explorerError } from '../../common/ExplorerMessage';
import { FabricGateway } from '../../platform/fabric/gateway/FabricGateway';
import * as FabricUtils from './utils/FabricUtils';

const logger = helper.getLogger('FabricClient');

/**
 *
 *
 * @class FabricClient
 */
export class FabricClient {
	network_id: string;
	fabricGateway: any;
	channelsGenHash: Map<string, any>;
	config: any;
	status: boolean;
	channels: string[];

	/**
	 * Creates an instance of FabricClient.
	 * @param {FabricConfig} config
	 * @memberof FabricClient
	 */
	constructor(config) {
		this.network_id = config.getNetworkId();
		this.fabricGateway = null;
		this.channelsGenHash = new Map();
		this.config = config;
		this.status = false;
		this.channels = [];
	}

	/**
	 *
	 *
	 * @param {*} persistence
	 * @memberof FabricClient
	 */
	async initialize(persistence) {
		// Before initializing a channel

		// Loading client from network configuration file
		logger.debug('Client configuration [%s]  ...', this.config.getNetworkId());

		try {
			// Use Gateway to connect to fabric network
			this.fabricGateway = new FabricGateway(this.config);
			await this.fabricGateway.initialize();
		} catch (error) {
			// TODO in case of the failure, should terminate explorer?
			logger.error(error);
			throw new ExplorerError(explorerError.ERROR_1009);
		}

		// Getting channels from queryChannels
		let channels;
		try {
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
			this.initializeDetachClient(persistence);
		} else {
			logger.error('Not found any channels');
		}
	}

	/**
	 *
	 *
	 * @param {*} persistence
	 * @memberof FabricClient
	 */
	async initializeDetachClient(persistence) {
		logger.debug('initializeDetachClient', this.config.getNetworkId());
		const network_config = this.config.getConfig();
		const peers = this.config.getPeersConfig();

		logger.info('initializeDetachClient, network config) ', network_config);
		logger.info(
			'************************************* initializeDetachClient *************************************************'
		);
		logger.info('Error :', explorerError.ERROR_1009);
		logger.info('Info : ', explorerError.MESSAGE_1001);
		logger.info(
			'************************************** initializeDetachClient ************************************************'
		);
		const channels = await persistence
			.getCrudService()
			.getChannelsInfo(this.network_id);

		if (channels.length === 0) {
			throw new ExplorerError(explorerError.ERROR_2003);
		}

		for (const channel of channels) {
			this.setChannelGenHash(channel.channelname, channel.channel_genesis_hash);
			const nodes = await persistence
				.getMetricService()
				.getPeerList(this.network_id, channel.channel_genesis_hash);
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
		logger.debug('Genesis Block for client [%s]', this.network_id);

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

		const discover_results = await this.fabricGateway.getDiscoveryResult(
			channel_name
		);

		if (discover_results && 'peers_by_org' in discover_results) {
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
	 * @returns
	 * @memberof FabricClient
	 */
	getChannelNames() {
		return Array.from(this.channelsGenHash.keys());
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
	getNetworkId() {
		return this.network_id;
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
	 * @returns
	 * @memberof FabricClient
	 */
	getStatus() {
		return this.status;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricClient
	 */
	getNetworkConfig() {
		return this.config.getConfig();
	}
}
