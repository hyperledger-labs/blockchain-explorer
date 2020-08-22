/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const helper = require('../../common/helper');

const logger = helper.getLogger('CRUDService');

/**
 *
 *
 * @class CRUDService
 */
class CRUDService {
	constructor(sql) {
		this.sql = sql;
	}

	/**
	 * Get transactions count by block number
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} blockNum
	 * @returns
	 * @memberof CRUDService
	 */

	getTxCountByBlockNum(network_name, channel_genesis_hash, blockNum) {
		return this.sql.getRowByPkOne(
			`select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} and network_name = '${network_name}' `
		);
	}

	/**
	 * Get transaction by ID
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} txhash
	 * @returns
	 * @memberof CRUDService
	 */
	getTransactionByID(network_name, channel_genesis_hash, txhash) {
		const sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
				t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash and t.network_name=channel.network_name
				where t.txhash = '${txhash}' and t.network_name = '${network_name}' `;
		return this.sql.getRowByPkOne(sqlTxById);
	}

	/**
	 * Returns the latest 'n' blocks by channel
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	getBlockActivityList(network_name, channel_genesis_hash) {
		const sqlBlockActivityList = `select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt, (
      SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
       channel_genesis_hash = '${channel_genesis_hash}' and network_name = '${network_name}' group by transactions.blockid ),
      channel.name as channelname  from blocks inner join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash  where
       blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0 and blocks.network_name = '${network_name}'
       order by blocks.blocknum desc limit 3`;
		return this.sql.getRowsBySQlQuery(sqlBlockActivityList);
	}

	/**
	 * Returns the list of transactions by channel, organization, date range and greater than a block and transaction id.
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} blockNum
	 * @param {*} txid
	 * @param {*} from
	 * @param {*} to
	 * @param {*} orgs
	 * @returns
	 * @memberof CRUDService
	 */
	getTxList(network_name, channel_genesis_hash, blockNum, txid, from, to, orgs) {
		let byOrgs = false;
		if (orgs && orgs !== '') {
			byOrgs = true;
		}

		logger.debug('getTxList.byOrgs ', byOrgs);

		const sqlTxListByOrgs = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash and t.network_name = channel.network_name where  t.blockid >= ${blockNum} and t.id >= ${txid} and t.creator_msp_id in (${orgs}) and
							t.channel_genesis_hash = '${channel_genesis_hash}' and t.network_name = '${network_name}' and t.createdt between '${from}' and '${to}'  order by  t.id desc`;

		const sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash and t.network_name = channel.network_name where  t.blockid >= ${blockNum} and t.id >= ${txid} and
							t.channel_genesis_hash = '${channel_genesis_hash}' and t.network_name = '${network_name}' and t.createdt between '${from}' and '${to}'  order by  t.id desc`;

		if (byOrgs) {
			return this.sql.getRowsBySQlQuery(sqlTxListByOrgs);
		}
		return this.sql.getRowsBySQlQuery(sqlTxList);
	}

	/**
	 *
	 * Returns the list of blocks and transactions by channel, organization, date range.
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} blockNum
	 * @param {*} from
	 * @param {*} to
	 * @param {*} orgs
	 * @returns
	 * @memberof CRUDService
	 */
	getBlockAndTxList(
		network_name,
		channel_genesis_hash,
		blockNum,
		from,
		to,
		orgs
	) {
		let byOrgs = false;
		// workaround for SQL injection
		if (orgs && orgs !== '') {
			byOrgs = true;
		}

		logger.debug('getBlockAndTxList.byOrgs ', byOrgs);

		const sqlBlockTxList = `select a.* from  (
      select (select c.name from channel c where c.channel_genesis_hash =
         '${channel_genesis_hash}' and c.network_name = '${network_name}') as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt, blocks.blksize, (
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
         channel_genesis_hash = '${channel_genesis_hash}' and network_name = '${network_name}' and createdt between '${from}' and '${to}') from blocks where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocks.network_name = '${network_name}' and blocknum >= 0 and blocks.createdt between '${from}' and '${to}'
									order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;

		logger.debug('sqlBlockTxList ', sqlBlockTxList);

		const sqlBlockTxListByOrgs = `select a.* from  (
										select (select c.name from channel c where c.channel_genesis_hash =
													'${channel_genesis_hash}' and c.network_name = '${network_name}' ) as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt, blocks.blksize, (
												SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum  and creator_msp_id in (${orgs}) and
													channel_genesis_hash = '${channel_genesis_hash}' and network_name = '${network_name}' and createdt between '${from}' and '${to}') from blocks where
													blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocks.network_name = '${network_name}' and blocknum >= 0 and blocks.createdt between '${from}' and '${to}'
													order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;
		if (byOrgs) {
			return this.sql.getRowsBySQlQuery(sqlBlockTxListByOrgs);
		}
		const ret = this.sql.getRowsBySQlQuery(sqlBlockTxList);
		logger.debug('Finished sqlBlockTxList ', ret);

		return ret;
	}

	/**
	 * Returns channel configuration
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	async getChannelConfig(network_name, channel_genesis_hash) {
		const channelConfig = await this.sql.getRowsBySQlCase(
			` select * from channel where channel_genesis_hash ='${channel_genesis_hash}' and network_name = '${network_name}' `
		);
		return channelConfig;
	}

	/**
	 * Returns channel by name, and channel genesis hash
	 *
	 * @param {*} channelname
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */
	async getChannel(network_name, channelname, channel_genesis_hash) {
		const channel = await this.sql.getRowsBySQlCase(
			` select * from channel where name='${channelname}' and channel_genesis_hash='${channel_genesis_hash}' and network_name = '${network_name}' `
		);
		return channel;
	}

	/**
	 *
	 * @param {*} channelname
	 * @returns
	 * @memberof CRUDService
	 */
	async existChannel(network_name, channelname) {
		const channel = await this.sql.getRowsBySQlCase(
			` select count(1) from channel where name='${channelname}' and network_name = '${network_name}' `
		);
		return channel;
	}

	/**
	 *
	 *
	 * @param {*} block
	 * @returns
	 * @memberof CRUDService
	 */
	/* eslint-disable */

	async saveBlock(network_name, block) {
		const c = await this.sql
			.getRowByPkOne(`select count(1) as c from blocks where blocknum='${block.blocknum}' and txcount='${block.txcount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and network_name = '${network_name}' and prehash='${block.prehash}' and datahash='${block.datahash}' `);

		if (isValidRow(c)) {
			block.network_name = network_name;
			await this.sql.saveRow('blocks', block);
			await this.sql.updateBySql(
				`update channel set blocks =blocks+1 where channel_genesis_hash='${block.channel_genesis_hash}' and network_name = '${network_name}' `
			);
			return true;
		}

		return false;
	}

	/* eslint-enable */

	/**
	 *
	 *
	 * @param {*} transaction
	 * @returns
	 * @memberof CRUDService
	 */
	async saveTransaction(network_name, transaction) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from transactions where blockid='${transaction.blockid}' and txhash='${transaction.txhash}' and channel_genesis_hash='${transaction.channel_genesis_hash}' and network_name = '${network_name}' `
		);

		if (isValidRow(c)) {
			transaction.network_name = network_name;
			await this.sql.saveRow('transactions', transaction);
			await this.sql.updateBySql(
				`update chaincodes set txcount =txcount+1 where channel_genesis_hash='${transaction.channel_genesis_hash}' and network_name = '${network_name}' and name='${transaction.chaincodename}'`
			);
			await this.sql.updateBySql(
				`update channel set trans =trans+1 where channel_genesis_hash='${transaction.channel_genesis_hash}' and network_name = '${network_name}' `
			);
			return true;
		}

		return false;
	}

	/**
	 * Returns latest block from blocks table
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */
	async getCurBlockNum(network_name, channel_genesis_hash) {
		let curBlockNum;
		try {
			const row = await this.sql.getRowsBySQlCase(
				`select max(blocknum) as blocknum from blocks  where channel_genesis_hash='${channel_genesis_hash}' and network_name = '${network_name}' `
			);

			if (row && row.blocknum) {
				curBlockNum = parseInt(row.blocknum);
			} else {
				curBlockNum = -1;
			}
		} catch (err) {
			logger.error(err);
			return -1;
		}

		return curBlockNum;
	}

	/* eslint-disable */
	/**
	 *
	 *
	 * @param {*} chaincode
	 * @memberof CRUDService
	 */
	async saveChaincode(network_name, chaincode) {
		const c = await this.sql
			.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and
        channel_genesis_hash='${chaincode.channel_genesis_hash}' and network_name = '${network_name}' and version='${chaincode.version}' and path='${chaincode.path}'`);

		if (isValidRow(c)) {
			chaincode.network_name = network_name;
			await this.sql.saveRow('chaincodes', chaincode);
		}
	}
	/* eslint-enable */

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */
	getChannelByGenesisBlockHash(network_name, channel_genesis_hash) {
		return this.sql.getRowByPkOne(
			`select name from channel where channel_genesis_hash='${channel_genesis_hash}' and network_name = '${network_name}' `
		);
	}

	/**
	 *
	 *
	 * @param {*} peers_ref_chaincode
	 * @memberof CRUDService
	 */
	async saveChaincodPeerRef(network_name, peers_ref_chaincode) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer_ref_chaincode prc where prc.peerid= '${peers_ref_chaincode.peerid}' and prc.chaincodeid='${peers_ref_chaincode.chaincodeid}' and cc_version='${peers_ref_chaincode.cc_version}' and channelid='${peers_ref_chaincode.channelid}' and network_name = '${network_name}' `
		);

		if (isValidRow(c)) {
			peers_ref_chaincode.network_name = network_name;
			await this.sql.saveRow('peer_ref_chaincode', peers_ref_chaincode);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @memberof CRUDService
	 */
	async saveChannel(network_name, channel) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from channel where name='${channel.name}' and channel_genesis_hash='${channel.channel_genesis_hash}' and network_name = '${network_name}' `
		);

		if (isValidRow(c)) {
			await this.sql.saveRow('channel', {
				name: channel.name,
				createdt: channel.createdt,
				blocks: channel.blocks,
				trans: channel.trans,
				channel_hash: channel.channel_hash,
				channel_genesis_hash: channel.channel_genesis_hash,
				network_name: network_name
			});
		} else {
			await this.sql.updateBySql(
				`update channel set blocks='${channel.blocks}',trans='${channel.trans}',channel_hash='${channel.channel_hash}' where name='${channel.name}'and channel_genesis_hash='${channel.channel_genesis_hash}' and network_name = '${network_name}' `
			);
		}
	}

	/**
	 *
	 *
	 * @param {*} peer
	 * @memberof CRUDService
	 */
	async savePeer(network_name, peer) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer where channel_genesis_hash='${peer.channel_genesis_hash}' and network_name = '${network_name}' and server_hostname='${peer.server_hostname}' `
		);

		if (isValidRow(c)) {
			peer.network_name = network_name;
			await this.sql.saveRow('peer', peer);
		}
	}

	/**
	 *
	 *
	 * @param {*} peers_ref_Channel
	 * @memberof CRUDService
	 */
	async savePeerChannelRef(network_name, peers_ref_Channel) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer_ref_channel prc where prc.peerid = '${peers_ref_Channel.peerid}' and network_name = '${network_name}' and prc.channelid='${peers_ref_Channel.channelid}' `
		);

		if (isValidRow(c)) {
			peers_ref_Channel.network_name = network_name;
			await this.sql.saveRow('peer_ref_channel', peers_ref_Channel);
		}
	}

	/**
	 *
	 *
	 * @param {*} peerid
	 * @returns
	 * @memberof CRUDService
	 */
	async getChannelsInfo(network_name) {
		const channels = await this.sql
			.getRowsBySQlNoCondition(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c,
        peer_ref_channel pc where c.channel_genesis_hash = pc.channelid and c.network_name = '${network_name}' group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `);

		return channels;
	}

	// Orderer BE-303
	/**
	 *
	 *
	 * @param {*} orderer
	 * @memberof CRUDService
	 */
	async saveOrderer(network_name, orderer) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from orderer where requests='${orderer.requests}' and network_name = '${network_name}' `
		);
		if (isValidRow(c)) {
			orderer.network_name = network_name;
			await this.sql.saveRow('orderer', orderer);
		}
	}
	// Orderer BE-303
}
module.exports = CRUDService;

/**
 *
 *
 * @param {*} rowResult
 * @returns
 */
function isValidRow(rowResult) {
	if (rowResult) {
		const val = rowResult.c;
		if (val === 0 || val === '0') {
			return true;
		}
	}
	return false;
}
