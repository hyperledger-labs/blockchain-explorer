/*
 * SPDX-License-Identifier: Apache-2.0
 */
const UserService = require('./service/UserService.js');
const helper = require('../../common/helper');
const NetworkService = require('./service/NetworkService.js');

const logger = helper.getLogger('Proxy');

const ExplorerError = require('../../common/ExplorerError');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;

/**
 *
 *
 * @class Proxy
 */
class Proxy {
	/**
	 * Creates an instance of Proxy.
	 * @param {*} platform
	 * @memberof Proxy
	 */
	constructor(platform) {
		this.platform = platform;
		this.persistence = platform.getPersistence();
		this.broadcaster = platform.getBroadcaster();
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof Proxy
	 */
	async authenticate(user) {
		const userService = new UserService(this.platform);
		let response = await userService.authenticate(user);
		if (!response) {
			response = {
				status: false,
				message: `Failed authentication for user: ${user} `
			};
		}
		logger.debug('login >> %s', response);
		return response;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	async networkList() {
		const networkService = new NetworkService(this.platform);
		let response = await networkService.networkList();
		if (!response) {
			response = {
				status: false,
				message: 'Failed to get network list '
			};
		}
		logger.debug('networkList >> %s', response);
		return response;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	async getCurrentChannel(network_name) {
		logger.debug('getCurrentChannel: network_name', network_name);

		const client = await this.platform.getClient(network_name);
		const channel = client.getDefaultChannel();
		const channel_genesis_hash = client.getChannelGenHash(channel.getName());
		let respose;
		if (channel_genesis_hash) {
			respose = {
				currentChannel: channel_genesis_hash
			};
		} else {
			respose = {
				status: 1,
				message: 'Channel not found in the Context ',
				currentChannel: ''
			};
		}
		logger.debug('getCurrentChannel >> %j', respose);
		return respose;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof Proxy
	 */
	async getPeersStatus(network_name, channel_genesis_hash) {
		const client = await this.platform.getClient(network_name);
		const channel = client.getDefaultChannel();
		const nodes = await this.persistence
			.getMetricService()
			.getPeerList(network_name, channel_genesis_hash);
		let discover_results;
		if (client.status) {
			try {
				discover_results = await client.initializeChannelFromDiscover(
					channel._name
				);
			} catch (e) {
				logger.debug('getPeersStatus >> ', e);
			}
		}

		const peers = [];

		for (const node of nodes) {
			if (node.peer_type === 'PEER') {
				node.status = 'DOWN';
				if (discover_results && discover_results.peers_by_org) {
					const org = discover_results.peers_by_org[node.mspid];
					for (const peer of org.peers) {
						if (peer.endpoint.indexOf(node.server_hostname) > -1) {
							node.ledger_height_low = peer.ledger_height.low;
							node.ledger_height_high = peer.ledger_height.high;
							node.ledger_height_unsigned = peer.ledger_height.unsigned;
						}
					}
				}
				peers.push(node);
			} else if (node.peer_type === 'ORDERER') {
				node.status = 'DOWN';
				if (discover_results && discover_results.orderers) {
					const org = discover_results.orderers[node.mspid];
					for (const endpoint of org.endpoints) {
						if (endpoint.host.indexOf(node.server_hostname) > -1) {
							node.ledger_height_low = '-';
							node.ledger_height_high = '-';
							node.ledger_height_unsigned = '-';
						}
					}
				}
				peers.push(node);
			}
		}

		logger.debug('getPeersStatus >> %j', peers.length);
		return peers;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof Proxy
	 */
	async changeChannel(network_name, channel_genesis_hash) {
		const client = this.platform.getClient(network_name);
		const respose = client.setDefaultChannelByHash(channel_genesis_hash);
		logger.debug('changeChannel >> %s', respose);
		return respose;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	async getChannelsInfo(network_name) {
		const client = this.platform.getClient(network_name);
		const channels = await this.persistence
			.getCrudService()
			.getChannelsInfo(network_name, client.getDefaultPeer());
		const currentchannels = [];
		for (const channel of channels) {
			const channel_genesis_hash = client.getChannelGenHash(channel.channelname);
			if (
				channel_genesis_hash &&
				channel_genesis_hash === channel.channel_genesis_hash
			) {
				currentchannels.push(channel);
			}
		}
		logger.debug('getChannelsInfo >> %j', currentchannels);
		return currentchannels;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof Proxy
	 */
	async getTxByOrgs(network_name, channel_genesis_hash) {
		const rows = await this.persistence
			.getMetricService()
			.getTxByOrgs(network_name, channel_genesis_hash);
		const organizations = await this.persistence
			.getMetricService()
			.getOrgsData(network_name, channel_genesis_hash);

		for (const organization of rows) {
			const index = organizations.indexOf(organization.creator_msp_id);
			if (index > -1) {
				organizations.splice(index, 1);
			}
		}
		for (const org_id of organizations) {
			rows.push({
				count: '0',
				creator_msp_id: org_id
			});
		}
		return rows;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} number
	 * @returns
	 * @memberof Proxy
	 */
	async getBlockByNumber(network_name, channel_genesis_hash, number) {
		const client = this.platform.getClient(network_name);
		const channel = client.getChannelByHash(channel_genesis_hash);
		let block;

		try {
			block = await channel.queryBlock(
				parseInt(number),
				client.getDefaultPeer(),
				true
			);
		} catch (e) {
			logger.debug('queryBlock >> ', e);
		}

		if (block) {
			return block;
		}
		logger.error('response_payloads is null');
		return 'response_payloads is null';
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	getClientStatus() {
		const client = this.platform.getClient();
		return client.getStatus();
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	async getChannels(network_name) {
		const client = this.platform.getClient(network_name);
		const client_channels = client.getChannelNames();
		const channels = await this.persistence
			.getCrudService()
			.getChannelsInfo(network_name, client.getDefaultPeer());
		const respose = [];

		for (let i = 0; i < channels.length; i++) {
			const index = client_channels.indexOf(channels[i].channelname);
			if (!(index > -1)) {
				await client.initializeNewChannel(channels[i].channelname);
			}
			respose.push(channels[i].channelname);
		}
		logger.debug('getChannels >> %j', respose);
		return respose;
	}

	/**
	 *
	 *
	 * @param {*} reqUser
	 * @returns
	 * @memberof Proxy
	 */
	async register(reqUser) {
		const userService = new UserService(this.platform);
		const response = await userService.register(reqUser);
		logger.debug('register >> %s', response);
		return response;
	}

	/**
	 *
	 *
	 * @param {*} reqUser
	 * @returns
	 * @memberof Proxy
	 */
	async enroll(reqUser) {
		const userService = new UserService(this.platform);
		const response = await userService.enroll(reqUser);
		logger.debug('enroll >> %s', response);
		return response;
	}

	/**
	 *
	 *
	 * @param {*} msg
	 * @memberof Proxy
	 */
	processSyncMessage(msg) {
		// Get message from child process
		logger.debug('Message from child %j', msg);
		if (fabric_const.NOTITY_TYPE_NEWCHANNEL === msg.notify_type) {
			// Initialize new channel instance in parent
			if (msg.network_name && msg.client_name) {
				const client = this.platform.getClient(msg.network_name);
				if (msg.channel_name) {
					client.initializeNewChannel(msg.channel_name);
				} else {
					logger.error(
						'Channel name should pass to process the notification from child process'
					);
				}
			} else {
				logger.error(
					'Network name and client name should pass to process the notification from child process'
				);
			}
		} else if (
			fabric_const.NOTITY_TYPE_UPDATECHANNEL === msg.notify_type ||
			fabric_const.NOTITY_TYPE_CHAINCODE === msg.notify_type
		) {
			// Update channel details in parent
			if (msg.network_name && msg.client_name) {
				const client = this.platform.getClient(msg.network_name);
				if (msg.channel_name) {
					client.initializeChannelFromDiscover(msg.channel_name);
				} else {
					logger.error(
						'Channel name should pass to process the notification from child process'
					);
				}
			} else {
				logger.error(
					'Network name and client name should pass to process the notification from child process'
				);
			}
		} else if (fabric_const.NOTITY_TYPE_BLOCK === msg.notify_type) {
			// Broad cast new block message to client
			const notify = {
				title: msg.title,
				type: msg.type,
				message: msg.message,
				time: msg.time,
				txcount: msg.txcount,
				datahash: msg.datahash
			};
			this.broadcaster.broadcast(notify);
		} else if (fabric_const.NOTITY_TYPE_EXISTCHANNEL === msg.notify_type) {
			throw new ExplorerError(explorer_error.ERROR_2009, msg.channel_name);
		} else if (msg.error) {
			throw new ExplorerError(explorer_error.ERROR_2010, msg.error);
		} else {
			logger.error(
				'Child process notify is not implemented for this type %s ',
				msg.notify_type
			);
		}
	}
}

module.exports = Proxy;
