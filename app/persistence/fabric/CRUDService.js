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

	getTxCountByBlockNum(channel_genesis_hash, blockNum) {
		return this.sql.getRowByPkOne(
			`select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} `
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
	getTransactionByID(channel_genesis_hash, txhash) {
		const sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
        t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where t.txhash = '${txhash}' `;
		return this.sql.getRowByPkOne(sqlTxById);
	}

	/**
	 * Returns the latest 'n' blocks by channel
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	getBlockActivityList(channel_genesis_hash) {
		const sqlBlockActivityList = `select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
      SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
       channel_genesis_hash = '${channel_genesis_hash}' group by transactions.blockid ),
      channel.name as channelname  from blocks inner join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash  where
       blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0
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
	getTxList(channel_genesis_hash, blockNum, txid, from, to, orgs) {
		let txListSql = '';
		if (orgs && orgs !== '') {
			txListSql = `and t.creator_msp_id in (${orgs})`;
		}
		const sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} ${txListSql} and
       t.channel_genesis_hash = '${channel_genesis_hash}'  and t.createdt between '${from}' and '${to}'  order by  t.id desc`;
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
	getBlockAndTxList(channel_genesis_hash, blockNum, from, to, orgs) {
		let blockTxListSql = '';
		if (orgs && orgs !== '') {
			blockTxListSql = `and creator_msp_id in (${orgs})`;
		}
		const sqlBlockTxList = `select a.* from  (
      select (select c.name from channel c where c.channel_genesis_hash =
         '${channel_genesis_hash}' ) as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum ${blockTxListSql} and
         channel_genesis_hash = '${channel_genesis_hash}' and createdt between '${from}' and '${to}') from blocks where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0 and blocks.createdt between '${from}' and '${to}'
         order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;
		return this.sql.getRowsBySQlQuery(sqlBlockTxList);
	}

	/**
	 * Returns channel configuration
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	async getChannelConfig(channel_genesis_hash) {
		const channelConfig = await this.sql.getRowsBySQlCase(
			` select * from channel where channel_genesis_hash ='${channel_genesis_hash}' `
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
	async getChannel(channelname, channel_genesis_hash) {
		const channel = await this.sql.getRowsBySQlCase(
			` select * from channel where name='${channelname}' and channel_genesis_hash='${channel_genesis_hash}' `
		);
		return channel;
	}

	/**
	 *
	 * @param {*} channelname
	 * @returns
	 * @memberof CRUDService
	 */
	async existChannel(channelname) {
		const channel = await this.sql.getRowsBySQlCase(
			` select count(1) from channel where name='${channelname}' `
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

	async saveBlock(block) {
		const c = await this.sql
			.getRowByPkOne(`select count(1) as c from blocks where blocknum='${
			block.blocknum
		}' and txcount='${block.txcount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and prehash='${
			block.prehash
		}' and datahash='${block.datahash}' `);

		if (isValidRow(c)) {
			await this.sql.saveRow('blocks', block);
			await this.sql.updateBySql(
				`update channel set blocks =blocks+1 where channel_genesis_hash='${
					block.channel_genesis_hash
				}'`
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
	async saveTransaction(transaction) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from transactions where blockid='${
				transaction.blockid
			}' and txhash='${transaction.txhash}' and channel_genesis_hash='${
				transaction.channel_genesis_hash
			}'`
		);

		if (isValidRow(c)) {
			await this.sql.saveRow('transactions', transaction);
			await this.sql.updateBySql(
				`update chaincodes set txcount =txcount+1 where channel_genesis_hash='${
					transaction.channel_genesis_hash
				}'`
			);
			await this.sql.updateBySql(
				`update channel set trans =trans+1 where channel_genesis_hash='${
					transaction.channel_genesis_hash
				}'`
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
	async getCurBlockNum(channel_genesis_hash) {
		let curBlockNum;
		try {
			const row = await this.sql.getRowsBySQlCase(
				`select max(blocknum) as blocknum from blocks  where channel_genesis_hash='${channel_genesis_hash}'`
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
	async saveChaincode(chaincode) {
		const c = await this.sql
			.getRowByPkOne(`select count(1) as c from chaincodes where name='${
			chaincode.name
		}' and
        channel_genesis_hash='${chaincode.channel_genesis_hash}' and version='${
			chaincode.version
		}' and path='${chaincode.path}'`);

		if (isValidRow(c)) {
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
	getChannelByGenesisBlockHash(channel_genesis_hash) {
		return this.sql.getRowByPkOne(
			`select name from channel where channel_genesis_hash='${channel_genesis_hash}'`
		);
	}

	/**
	 *
	 *
	 * @param {*} peers_ref_chaincode
	 * @memberof CRUDService
	 */
	async saveChaincodPeerRef(peers_ref_chaincode) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer_ref_chaincode prc where prc.peerid= '${
				peers_ref_chaincode.peerid
			}' and prc.chaincodeid='${
				peers_ref_chaincode.chaincodeid
			}' and cc_version='${peers_ref_chaincode.cc_version}' and channelid='${
				peers_ref_chaincode.channelid
			}'`
		);

		if (isValidRow(c)) {
			await this.sql.saveRow('peer_ref_chaincode', peers_ref_chaincode);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @memberof CRUDService
	 */
	async saveChannel(channel) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from channel where name='${
				channel.name
			}' and channel_genesis_hash='${channel.channel_genesis_hash}'`
		);

		if (isValidRow(c)) {
			await this.sql.saveRow('channel', {
				name: channel.name,
				createdt: channel.createdt,
				blocks: channel.blocks,
				trans: channel.trans,
				channel_hash: channel.channel_hash,
				channel_genesis_hash: channel.channel_genesis_hash
			});
		} else {
			await this.sql.updateBySql(
				`update channel set blocks='${channel.blocks}',trans='${
					channel.trans
				}',channel_hash='${channel.channel_hash}' where name='${
					channel.name
				}'and channel_genesis_hash='${channel.channel_genesis_hash}'`
			);
		}
	}

	/**
	 *
	 *
	 * @param {*} peer
	 * @memberof CRUDService
	 */
	async savePeer(peer) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer where channel_genesis_hash='${
				peer.channel_genesis_hash
			}' and server_hostname='${peer.server_hostname}' `
		);

		if (isValidRow(c)) {
			await this.sql.saveRow('peer', peer);
		}
	}

	/**
	 *
	 *
	 * @param {*} peers_ref_Channel
	 * @memberof CRUDService
	 */
	async savePeerChannelRef(peers_ref_Channel) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from peer_ref_channel prc where prc.peerid = '${
				peers_ref_Channel.peerid
			}' and prc.channelid='${peers_ref_Channel.channelid}' `
		);

		if (isValidRow(c)) {
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
	async getChannelsInfo(peerid) {
		const channels = await this.sql
			.getRowsBySQlNoCondition(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c,
        peer_ref_channel pc where c.channel_genesis_hash = pc.channelid and pc.peerid='${peerid}' group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `);

		return channels;
	}

	// Orderer BE-303
	/**
	 *
	 *
	 * @param {*} orderer
	 * @memberof CRUDService
	 */
	async saveOrderer(orderer) {
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from orderer where requests='${orderer.requests}' `
		);
		if (isValidRow(c)) {
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
