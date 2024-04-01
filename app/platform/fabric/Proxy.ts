/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { helper } from '../../common/helper';

import { NetworkService } from './service/NetworkService';
import { ExplorerError } from '../../common/ExplorerError';
import { explorerError } from '../../common/ExplorerMessage';
import * as FabricConst from './utils/FabricConst';
import { SyncPlatform } from './sync/SyncPlatform';
import {
	convertValidationCode,
	jsonObjSize,
	SyncServices
} from './sync/SyncService';
import * as sha from 'js-sha256';
import * as FabricUtils from './utils/FabricUtils';

const fabric_const = FabricConst.fabric.const;

const logger = helper.getLogger('Proxy');

/**
 *
 *
 * @class Proxy
 */
export class Proxy {
	platform: any;
	persistence: any;
	broadcaster: any;
	userService: any;

	/**
	 * Creates an instance of Proxy.
	 * @param {*} platform
	 * @memberof Proxy
	 */
	constructor(platform, userService) {
		this.platform = platform;
		this.persistence = platform.getPersistence();
		this.broadcaster = platform.getBroadcaster();
		this.userService = userService;
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof Proxy
	 */
	async authenticate(user) {
		const response = await this.userService.authenticate(user);
		logger.debug('result of authentication >> %j', response);
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
			response = [
				{
					status: false,
					message: 'Failed to get network list '
				}
			];
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
	async getCurrentChannel(network_id) {
		logger.debug('getCurrentChannel: network_id', network_id);

		const client = await this.platform.getClient(network_id);
		const channel_name = Object.keys(client.fabricGateway.config.channels)[0];
		const channel_genesis_hash = client.getChannelGenHash(channel_name);
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
	async getPeersStatus(network_id, channel_genesis_hash) {
		const client = await this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		let orderersList = await client.fabricGateway.getActiveOrderersList(
			channel_name
		);
		const nodes = await this.persistence
			.getMetricService()
			.getPeerList(network_id, channel_genesis_hash);
		let discover_results;
		if (client.status) {
			try {
				discover_results = await client.initializeChannelFromDiscover(channel_name);
			} catch (e) {
				logger.debug('getPeersStatus >> ', e);
			}
		}

		const peers = [];

		for (const node of nodes) {
			node.status = '';
			if (node.peer_type === 'PEER') {
				if (discover_results && discover_results.peers_by_org) {
					node.status = 'DOWN';
					const org = discover_results.peers_by_org[node.mspid];
					if (org === undefined) {
						continue;
					}
					for (const peer of org.peers) {
						if (peer.endpoint === node.requests) {
							node.ledger_height_low = peer.ledgerHeight.low;
							node.ledger_height_high = peer.ledgerHeight.high;
							node.ledger_height_unsigned = peer.ledgerHeight.unsigned;
							node.status = 'UP';
						}
					}
				}
				// Sometime 'peers_by_org' property is not included in discover result
				if (typeof node.ledger_height_low === 'undefined') {
					node.ledger_height_low = '-';
				}
				if (typeof node.ledger_height_high === 'undefined') {
					node.ledger_height_high = '-';
				}
				if (typeof node.ledger_height_unsigned === 'undefined') {
					node.ledger_height_unsigned = '-';
				}
				peers.push(node);
			} else if (node.peer_type === 'ORDERER') {
				node.status = 'DOWN';
				node.ledger_height_low = '-';
				node.ledger_height_high = '-';
				node.ledger_height_unsigned = '-';
				let orderersCount = orderersList.length;
				if (orderersCount != 0) {
					for (const orderer of orderersList) {
						if (orderer.name === node.requests && orderer.connected == true) {
							node.status = 'UP';
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
	async changeChannel(network_id, channel_genesis_hash) {
		return channel_genesis_hash;
	}

	/**
	 * Returns the latest block time of the channel
	 *
	 * @param {*} channel
	 * @returns
	 * @memberof Proxy
	 */
	getLatestBlockTime(channel) {
		let latestBlockEntry: Date;
		let agoBlockTime: string;
		latestBlockEntry = channel.latestdate;
		const latestBlockEntryTime = latestBlockEntry.getTime();
		const currentBlockDate = Date.now();
		const agoBlockTimeDiff = currentBlockDate - latestBlockEntryTime;
		const seconds = Math.floor(agoBlockTimeDiff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		if (days > 0) {
			agoBlockTime = days + 'day(s)';
		} else if (hours > 0) {
			agoBlockTime = hours + 'hour(s)';
		} else if (minutes > 0) {
			agoBlockTime = minutes + 'minute(s)';
		} else if (seconds > 0) {
			agoBlockTime = seconds + 'second(s)';
		}
		return agoBlockTime;
	}

	/**
	 * Returns the channel data with latest block time
	 *
	 * @param {*} network_id
	 * @returns
	 * @memberof Proxy
	 */
	async getChannelsInfo(network_id) {
		try {
			const client = this.platform.getClient(network_id);
			const channels = await this.persistence
				.getCrudService()
				.getChannelsInfo(network_id);
			const updatedChannels = [];

			for (const channel of channels) {
				const channel_genesis_hash = client.getChannelGenHash(channel.channelname);
				let agoBlockTimes = this.getLatestBlockTime(channel);
				let channel_members = await client.fabricGateway.queryEndorsersCommitter(
					channel.channelname
				);

				try {
					const chainInfo = await client.fabricGateway.queryChainInfo(
						channel.channelname
					);

					if (chainInfo && chainInfo.height && chainInfo.height.low >= 0) {
						const totalBlocks = chainInfo.height.low;

						if (
							channel_genesis_hash &&
							channel_genesis_hash === channel.channel_genesis_hash
						) {
							updatedChannels.push({
								...channel,
								totalBlocks,
								agoBlockTimes,
								channel_members
							});
						} else {
							updatedChannels.push({ ...channel, totalBlocks });
						}
					} else {
						logger.warn(
							`Invalid chain information for channel: ${channel.channelname}`
						);
					}
				} catch (error) {
					logger.error(
						`Error querying chain information for channel: ${channel.channelname}`,
						error
					);
				}
			}

			logger.debug('getChannelsInfo %j', updatedChannels);
			return updatedChannels;
		} catch (error) {
			logger.error('Error querying channel information:', error);
			return null;
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof Proxy
	 */
	async getTxByOrgs(network_id, channel_genesis_hash) {
		const rows = await this.persistence
			.getMetricService()
			.getTxByOrgs(network_id, channel_genesis_hash);
		const organizations = await this.persistence
			.getMetricService()
			.getOrgsData(network_id, channel_genesis_hash);

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
	async getBlockByNumber(network_id, channel_genesis_hash, number) {
		const client = this.platform.getClient(network_id);
		const channelName = client.getChannelNameByHash(channel_genesis_hash);
		let block;

		try {
			block = await client.fabricGateway.queryBlock(channelName, parseInt(number));
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
	async getChannels(network_id) {
		const client = this.platform.getClient(network_id);
		const client_channels = client.getChannelNames();
		const channels = await this.persistence
			.getCrudService()
			.getChannelsInfo(network_id);
		const respose = [];

		for (let i = 0; i < channels.length; i++) {
			const index = client_channels.indexOf(channels[i].channelname);
			if (index <= -1) {
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
		const response = await this.userService.register(reqUser);
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
	async unregister(reqUser) {
		const response = await this.userService.unregister(reqUser);
		logger.debug('unregister >> %s', response);
		return response;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Proxy
	 */
	async userlist(reqUser) {
		const response = await this.userService.userlist(reqUser);
		logger.debug('userlist >> %s', response);
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
			if (msg.network_id) {
				const client = this.platform.getClient(msg.network_id);
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
			if (msg.network_id) {
				const client = this.platform.getClient(msg.network_id);
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
			throw new ExplorerError(explorerError.ERROR_2009, msg.channel_name);
		} else if (msg.error) {
			throw new ExplorerError(explorerError.ERROR_2010, msg.error);
		} else {
			logger.error(
				'Child process notify is not implemented for this type %s ',
				msg.notify_type
			);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} blockNo
	 * @returns
	 * @memberof Proxy
	 */
	async fetchDataByBlockNo(
		network_id: string,
		channel_genesis_hash: string,
		blockNo: number
	) {
		return await this.dataByBlockNo(network_id, channel_genesis_hash, blockNo);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} txnId
	 * @returns
	 * @memberof Proxy
	 */
	async fetchDataByTxnId(
		network_id: string,
		channel_genesis_hash: string,
		txnId: string
	) {
		const results = await this.persistence
			.getCrudService()
			.getTransactionByID(network_id, channel_genesis_hash, txnId);
		if (results == null) {
			return await this.queryTxFromLedger(network_id, channel_genesis_hash, txnId);
		}
		return results;
	}

	async queryTxFromLedger(
		network_id: string,
		channel_genesis_hash: string,
		txnId: string
	) {
		let syncPlatform = new SyncPlatform(this.persistence, null);
		let sync = new SyncServices(syncPlatform, this.persistence);
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		try {
			const txn = await client.fabricGateway.queryTransaction(channel_name, txnId);
			logger.info('Transaction details from query Transaction ', txn);
			if (txn) {
				//Formatting of transaction details
				const txObj = txn.transactionEnvelope;
				const txStr = JSON.stringify(txObj);
				let txid = txObj.payload.header.channel_header.tx_id;
				let validation_code = '';
				let payload_proposal_hash = '';
				let chaincode = '';
				let rwset;
				let readSet;
				let writeSet;
				let chaincodeID;
				let mspId = [];

				sync.convertFormatOfValue(
					'value',
					client.fabricGateway.fabricConfig.getRWSetEncoding(),
					txObj
				);
				if (txid && txid !== '') {
					const val_code = txn.validationCode;
					validation_code = convertValidationCode(val_code);
				}
				if (txObj.payload.data.actions !== undefined) {
					chaincode =
						txObj.payload.data.actions[0].payload.action.proposal_response_payload
							.extension.chaincode_id.name;
					chaincodeID = new Uint8Array(
						txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension
					);
					mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(
						endorsement => endorsement.endorser.mspid
					);
					rwset =
						txObj.payload.data.actions[0].payload.action.proposal_response_payload
							.extension.results.ns_rwset;

					readSet = rwset.map(rw => ({
						chaincode: rw.namespace,
						set: rw.rwset.reads
					}));

					writeSet = rwset.map(rw => ({
						chaincode: rw.namespace,
						set: rw.rwset.writes
					}));

					payload_proposal_hash = txObj.payload.data.actions[0].payload.action.proposal_response_payload.proposal_hash.toString(
						'hex'
					);
				}
				if (txObj.payload.header.channel_header.typeString === 'CONFIG') {
					txid = sha.sha256(txStr);
					readSet =
						txObj.payload.data.last_update.payload?.data.config_update.read_set;
					writeSet =
						txObj.payload.data.last_update.payload?.data.config_update.write_set;
				}

				const chaincode_id = String.fromCharCode.apply(null, chaincodeID);
				const transaction = {
					channel_name,
					txhash: txid,
					createdt: txObj.payload.header.channel_header.timestamp,
					chaincodename: chaincode,
					chaincode_id,
					creator_msp_id: txObj.payload.header.signature_header.creator.mspid,
					endorser_msp_id: mspId,
					type: txObj.payload.header.channel_header.typeString,
					readSet,
					writeSet,
					validation_code,
					payload_proposal_hash
				};
				return transaction;
			}
			return txn;
		} catch (e) {
			logger.debug('No transaction found with this txn id >> ', e);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} startBlockNo
	 * @param {*} endBlockNo
	 * @returns
	 * @memberof Proxy
	 */
	async fetchDataByBlockRange(
		network_id: string,
		channel_genesis_hash: string,
		startBlockNo: number,
		endBlockNo: number
	) {
		let blockValue,
			blockArray = [];
		for (let index = startBlockNo; index <= endBlockNo; index++) {
			blockValue = await this.dataByBlockNo(
				network_id,
				channel_genesis_hash,
				index
			);
			if (blockValue != 'response_payloads is null') {
				blockArray.push(blockValue);
			} else break;
		}
		if (blockArray.length > 0) {
			return blockArray;
		}
		return blockValue;
	}

	//Re-usable component to fetch data using block no and block range
	async dataByBlockNo(
		network_id: string,
		channel_genesis_hash: string,
		blockNo: number
	) {
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		//fetch data from postgress
		const results = await this.persistence
			.getCrudService()
			.getBlockByBlocknum(network_id, channel_genesis_hash, blockNo);
		if (results == null) {
			const block = await this.getBlockByNumber(
				network_id,
				channel_genesis_hash,
				blockNo
			);
			if (block != 'response_payloads is null') {
				logger.info('block details from gateway', block);
				return await this.formatBlockData(
					block,
					channel_genesis_hash,
					channel_name
				);
			}
			return block;
		}
		return results;
	}

	/*
	 * @param {*} contract_name
	 * @returns
	 * @memberof Proxy
	 */
	async getContractMetadata(network_id, contract_name, channel_genesis_hash) {
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		let metadata;
		try {
			metadata = await client.fabricGateway.queryContractMetadata(
				channel_name,
				contract_name,
				channel_genesis_hash
			);
		} catch (e) {
			logger.debug('getContractMetadata >> ', e);
		}
		if (metadata) {
			return metadata;
		}
		logger.error('response_payloads is null');
		return 'response_payloads is null';
	}

	async fetchBlockByTxId(network_id, channel_genesis_hash, txnId) {
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		let block;
		try {
			block = await client.fabricGateway.queryBlockByTxId(channel_name, txnId);
		} catch (error) {
			logger.debug('getBlockByTxId ', error);
		}
		if (block) {
			logger.info('block details from queryBlockByTxId ', block);
			return await this.formatBlockData(block, channel_genesis_hash, channel_name);
		}
		logger.error('response_payloads is null');
		return null;
	}

	async fetchBlockByHash(network_id, channel_genesis_hash, hash) {
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		let block;
		try {
			block = await client.fabricGateway.queryBlockByHash(channel_name, hash);
		} catch (error) {
			logger.debug('getBlockByTxId ', error);
		}
		if (block) {
			logger.info('block details from queryBlockByHash ', block);
			return await this.formatBlockData(block, channel_genesis_hash, channel_name);
		}
		logger.error('response_payloads is null');
		return null;
	}

	async fetchEndorsersCommitter(network_id, channel_genesis_hash) {
		const client = this.platform.getClient(network_id);
		const channel_name = client.getChannelNameByHash(channel_genesis_hash);
		let channel_members;
		try {
			channel_members = await client.fabricGateway.queryEndorsersCommitter(
				channel_name
			);
		} catch (err) {
			logger.error('Failed to get the data from fabric-network : ', err);
		}
		if (channel_members) {
			return channel_members;
		}
		logger.error('response_payloads is null');
		return null;
	}

	async formatBlockData(block, channel_genesis_hash, channel_name) {
		const first_tx = block.data.data[0];
		const header = first_tx.payload.header;
		const createdt = await FabricUtils.getBlockTimeStamp(
			header.channel_header.timestamp
		);
		const blockhash = await FabricUtils.generateBlockHash(block.header);

		const txLen = block.data.data.length;
		let txArray = [];
		for (let txIndex = 0; txIndex < txLen; txIndex++) {
			const txObj = block.data.data[txIndex];
			let txid = txObj.payload.header.channel_header.tx_id;
			txArray.push(txid);
		}
		const blockData = {
			channelname: channel_name,
			blocknum: block.header.number.toString(),
			datahash: block.header.data_hash.toString('hex'),
			prehash: block.header.previous_hash.toString('hex'),
			txcount: block.data.data.length,
			createdt,
			prev_blockhash: '',
			blockhash,
			channel_genesis_hash,
			blksize: jsonObjSize(block),
			txhash: txArray
		};
		return blockData;
	}
}
