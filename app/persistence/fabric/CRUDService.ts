/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { PgService } from '../postgreSQL/PgService';
import { helper } from '../../common/helper';

const logger = helper.getLogger('CRUDService');

/**
 *
 *
 * @class CRUDService
 */
export class CRUDService {
	sql: PgService;

	constructor(sql: PgService) {
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

	getTxCountByBlockNum(
		network_name: any,
		channel_genesis_hash: any,
		blockNum: any
	) {
		return this.sql.getRowByPkOne(
			'select blocknum ,txcount from blocks where channel_genesis_hash=$1 and blocknum=$2 and network_name = $3',
			[channel_genesis_hash, blockNum, network_name]
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
	getTransactionByID(network_name: any, channel_genesis_hash: any, txhash: any) {
		const sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
				t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash and t.network_name=channel.network_name
				where t.txhash = $1 and t.network_name = $2 `;
		return this.sql.getRowByPkOne(sqlTxById, [txhash, network_name]);
	}

	/**
	 * Returns the latest 'n' blocks by channel
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	getBlockActivityList(network_name: any, channel_genesis_hash: any) {
		const sqlBlockActivityList = `select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt, (
      SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
       channel_genesis_hash = $1 and network_name = $2 group by transactions.blockid ),
      channel.name as channelname  from blocks inner join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash  where
       blocks.channel_genesis_hash = $1 and blocknum >= 0 and blocks.network_name = $2
       order by blocks.blocknum desc limit 3`;
		return this.sql.getRowsBySQlQuery(sqlBlockActivityList, [
			channel_genesis_hash,
			network_name
		]);
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
	getTxList(
		network_name: any,
		channel_genesis_hash: any,
		blockNum: any,
		txid: any,
		from: any,
		to: any,
		orgs: string
	) {
		let sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash and t.network_name = channel.network_name where  t.blockid >= $1 and t.id >= $2 and
							t.channel_genesis_hash = $3 and t.network_name = $4 and t.createdt between $5 and $6 `;
		const values = [blockNum, txid, channel_genesis_hash, network_name, from, to];

		if (orgs && orgs.length > 0) {
			sqlTxList += ' and t.creator_msp_id = ANY($7)';
			values.push(orgs);
		}
		sqlTxList += ' order by t.createdt desc';

		return this.sql.getRowsBySQlQuery(sqlTxList, values);
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
		network_name: any,
		channel_genesis_hash: any,
		blockNum: any,
		from: any,
		to: any,
		orgs: string[]
	) {
		const values = [channel_genesis_hash, network_name, from, to];
		let byOrgs = '';
		if (orgs && orgs.length > 0) {
			values.push(orgs);
			byOrgs = ' and creator_msp_id = ANY($5)';
		}

		logger.debug('getBlockAndTxList.byOrgs ', byOrgs);

		const sqlBlockTxList = `select a.* from  (
	  select (select c.name from channel c where c.channel_genesis_hash =$1 and c.network_name = $2) 
	  	as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt, blocks.blksize, (
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum ${byOrgs} and 
         channel_genesis_hash = $1 and network_name = $2 and createdt between $3 and $4) from blocks where
         blocks.channel_genesis_hash =$1 and blocks.network_name = $2 and blocknum >= 0 and blocks.createdt between $3 and $4
									order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;

		logger.debug('sqlBlockTxList ', sqlBlockTxList);

		return this.sql.getRowsBySQlQuery(sqlBlockTxList, values);
	}

	/**
	 * Returns channel configuration
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof CRUDService
	 */

	async getChannelConfig(network_name: any, channel_genesis_hash: any) {
		const channelConfig = await this.sql.getRowsBySQlCase(
			' select * from channel where channel_genesis_hash =$1 and network_name = $2 ',
			[channel_genesis_hash, network_name]
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
	async getChannel(
		network_name: any,
		channelname: any,
		channel_genesis_hash: any
	) {
		const channel = await this.sql.getRowsBySQlCase(
			' select * from channel where name=$1 and channel_genesis_hash=$2 and network_name = $3 ',
			[channelname, channel_genesis_hash, network_name]
		);
		return channel;
	}

	/**
	 *
	 * @param {*} channelname
	 * @returns
	 * @memberof CRUDService
	 */
	async existChannel(network_name: any, channelname: any) {
		const channel = await this.sql.getRowsBySQlCase(
			' select count(1) from channel where name=$1 and network_name = $2 ',
			[channelname, network_name]
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
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from blocks where blocknum=$1 and txcount=$2
		and channel_genesis_hash=$3 and network_name =$4 and prehash=$5 and datahash=$6 `,
			[
				block.blocknum,
				block.txcount,
				block.channel_genesis_hash,
				network_name,
				block.prehash,
				block.datahash
			]
		);

		if (isValidRow(c)) {
			block.network_name = network_name;
			await this.sql.saveRow('blocks', block);
			await this.sql.updateBySql(
				`update channel set blocks =blocks+1 where channel_genesis_hash=$1 and network_name = $2 `,
				[block.channel_genesis_hash, network_name]
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
			'select count(1) as c from transactions where blockid=$1 and txhash=$2 and channel_genesis_hash=$3 and network_name = $4 ',
			[
				transaction.blockid,
				transaction.txhash,
				transaction.channel_genesis_hash,
				network_name
			]
		);

		if (isValidRow(c)) {
			transaction.network_name = network_name;
			await this.sql.saveRow('transactions', transaction);
			await this.sql.updateBySql(
				'update chaincodes set txcount =txcount+1 where channel_genesis_hash=$1 and network_name = $2 and name=$3',
				[transaction.channel_genesis_hash, network_name, transaction.chaincodename]
			);
			await this.sql.updateBySql(
				'update channel set trans =trans+1 where channel_genesis_hash=$1 and network_name = $2 ',
				[transaction.channel_genesis_hash, network_name]
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
			const row: any = await this.sql.getRowsBySQlCase(
				'select max(blocknum) as blocknum from blocks  where channel_genesis_hash=$1 and network_name = $2 ',
				[channel_genesis_hash, network_name]
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
		const c = await this.sql.getRowByPkOne(
			`select count(1) as c from chaincodes where name=$1 and 
		channel_genesis_hash=$2 and network_name = $3 and version=$4 and path=$5`,
			[
				chaincode.name,
				chaincode.channel_genesis_hash,
				network_name,
				chaincode.version,
				chaincode.path
			]
		);

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
			'select name from channel where channel_genesis_hash=$1 and network_name = $2 ',
			[channel_genesis_hash, network_name]
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
			'select count(1) as c from peer_ref_chaincode prc where prc.peerid=$1 and prc.chaincodeid=$2 and cc_version=$3 and channelid=$4 and network_name = $5 ',
			[
				peers_ref_chaincode.peerid,
				peers_ref_chaincode.chaincodeid,
				peers_ref_chaincode.cc_version,
				peers_ref_chaincode.channelid,
				network_name
			]
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
			'select count(1) as c from channel where name=$1 and channel_genesis_hash=$2 and network_name = $3 ',
			[channel.name, channel.channel_genesis_hash, network_name]
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
				'update channel set blocks=$1,trans=$2,channel_hash=$3 where name=$4 and channel_genesis_hash=$5 and network_name = $6 ',
				[
					channel.blocks,
					channel.trans,
					channel.channel_hash,
					channel.name,
					channel.channel_genesis_hash,
					network_name
				]
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
			'select count(1) as c from peer where channel_genesis_hash=$1 and network_name = $2 and server_hostname=$3 ',
			[peer.channel_genesis_hash, network_name, peer.server_hostname]
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
			'select count(1) as c from peer_ref_channel prc where prc.peerid = $1 and network_name = $2 and prc.channelid=$3 ',
			[peers_ref_Channel.peerid, network_name, peers_ref_Channel.channelid]
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
		const channels = await this.sql.getRowsBySQlNoCondition(
			` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c,
		peer_ref_channel pc where c.channel_genesis_hash = pc.channelid and c.network_name = $1 group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `,
			[network_name]
		);

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
			'select count(1) as c from orderer where requests=$1 and network_name = $2 ',
			[orderer.requests, network_name]
		);
		if (isValidRow(c)) {
			orderer.network_name = network_name;
			await this.sql.saveRow('orderer', orderer);
		}
	}
	// Orderer BE-303
}

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
