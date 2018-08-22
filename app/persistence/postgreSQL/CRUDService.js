/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var sql = require('./db/pgservice.js');
var helper = require('../../helper.js');
var fs = require('fs');
var path = require('path');
var logger = helper.getLogger('blockscanner');

class CRUDService {
  constructor() {}

  getTxCountByBlockNum(channel_genesis_hash, blockNum) {
    return sql.getRowByPkOne(
      `select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} `
    );
  }

  getTransactionByID(channel_genesis_hash, txhash) {
    let sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
        t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where t.txhash = '${txhash}' `;
    return sql.getRowByPkOne(sqlTxById);
  }

  getBlockActivityList(channel_genesis_hash) {
    let sqlBlockActivityList = `select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
      SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
       channel_genesis_hash = '${channel_genesis_hash}' group by transactions.blockid ),
      channel.name as channelname  from blocks inner join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash  where
       blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0
       order by blocks.blocknum desc limit 3`;
    return sql.getRowsBySQlQuery(sqlBlockActivityList);
  }

  getTxList(channel_genesis_hash, blockNum, txid, from, to, orgs) {
    let orgsSql = '';
    if (orgs && orgs != '') {
      orgsSql = `and t.creator_msp_id in (${orgs})`;
    }

    let sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} ${orgsSql} and
       t.channel_genesis_hash = '${channel_genesis_hash}'  and t.createdt between '${from}' and '${to}'  order by  t.id desc`;
    return sql.getRowsBySQlQuery(sqlTxList);
  }

  getBlockAndTxList(channel_genesis_hash, blockNum, from, to, orgs) {
    let orgsSql = '';
    if (orgs && orgs != '') {
      orgsSql = `and creator_msp_id in (${orgs})`;
    }
    let sqlBlockTxList = `select a.* from  (
      select (select c.name from channel c where c.channel_genesis_hash =
         '${channel_genesis_hash}' ) as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum ${orgsSql} and
         channel_genesis_hash = '${channel_genesis_hash}' and createdt between '${from}' and '${to}') from blocks where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0 and blocks.createdt between '${from}' and '${to}'
         order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;
    return sql.getRowsBySQlQuery(sqlBlockTxList);
  }

  async getChannelConfig(channel_genesis_hash) {
    let channelConfig = await sql.getRowsBySQlCase(
      ` select * from channel where channel_genesis_hash ='${channel_genesis_hash}' `
    );
    return channelConfig;
  }

  async saveChannelRow(artifacts) {
    var channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
    var channelConfig = fs.readFileSync(artifacts.channelConfigPath);
    try {
      let insert = await sql.saveRow('channel', {
        name: artifacts.channelName,
        channel_hash: artifacts.channelHash,
        channel_config: channelConfig,
        channel_tx: channelTxArtifacts,
        createdt: new Date()
      });

      let resp = {
        success: true,
        message: 'Channel ' + artifacts.channelName + ' saved'
      };

      return resp;
    } catch (err) {
      let resp = {
        success: false,
        message:
          'Faile to save channel ' + artifacts.channelName + ' in database '
      };
      return resp;
    }
  }

  async saveBlock(block) {
    let c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${
      block.blockNum
    }' and txcount='${block.txCount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and prehash='${
      block.preHash
    }' and datahash='${block.dataHash}' `);
    if (c.c == 0) {
      await sql.saveRow('blocks', {
        blocknum: block.blockNum,
        prehash: block.preHash,
        datahash: block.dataHash,
        blockhash: block.blockhash,
        txcount: block.txCount,
        channel_genesis_hash: block.channel_genesis_hash,
        createdt: new Date(block.firstTxTimestamp)
      });

      return true;
    }

    return false;
  }

  async saveTransaction(transaction) {
    await sql.saveRow('transactions', transaction);
    await sql.updateBySql(
      `update chaincodes set txcount =txcount+1 where name = '${
        transaction.chaincodename
      }' and channel_genesis_hash='${transaction.channel_genesis_hash}'`
    );
  }

  async getCurBlockNum(channel_genesis_hash) {
    try {
      var row = await sql.getRowsBySQlCase(
        `select max(blocknum) as blocknum from blocks  where channel_genesis_hash='${channel_genesis_hash}'`
      );
    } catch (err) {
      logger.error(err);
      return -1;
    }

    let curBlockNum;

    if (row == null || row.blocknum == null) {
      curBlockNum = -1;
    } else {
      curBlockNum = parseInt(row.blocknum);
    }

    return curBlockNum;
  }

  // ====================chaincodes=====================================
  async saveChaincode(chaincode) {
    let c = await sql.getRowByPkOne(
      `select count(1) as c from chaincodes where name='${
        chaincode.name
      }' and channel_genesis_hash='${
        chaincode.channel_genesis_hash
      }' and version='${chaincode.version}' and path='${chaincode.path}'`
    );
    if (c.c == 0) {
      await sql.saveRow('chaincodes', chaincode);
    }
  }

  getChannelByGenesisBlockHash(channel_genesis_hash) {
    return sql.getRowByPkOne(
      `select name from channel where channel_genesis_hash='${channel_genesis_hash}'`
    );
  }

  async saveChannel(channel) {
    let c = await sql.getRowByPkOne(
      `select count(1) as c from channel where name='${
        channel.name
      }' and channel_genesis_hash='${channel.channel_genesis_hash}'`
    );
    if (c.c == 0) {
      await sql.saveRow('channel', {
        name: channel.name,
        createdt: channel.createdt,
        blocks: channel.blocks,
        trans: channel.trans,
        channel_hash: channel.channel_hash,
        channel_genesis_hash: channel.channel_genesis_hash
      });
    } else {
      await sql.updateBySql(
        `update channel set blocks='${channel.blocks}',trans='${
          channel.trans
        }',channel_hash='${channel.channel_hash}' where name='${
          channel.name
        }'and channel_genesis_hash='${channel.channel_genesis_hash}'`
      );
    }
  }

  async savePeer(peer) {
    let c = await sql.getRowByPkOne(
      `select count(1) as c from peer where channel_genesis_hash='${
        peer.channel_genesis_hash
      }' and requests='${peer.requests}' `
    );
    if (c.c == 0) {
      await sql.saveRow('peer', peer);
    }
  }

  async getChannelsInfo() {
    var channels = await sql.getRowsBySQlNoCondtion(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c
        group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `);

    return channels;
  }

  // ====================Orderer BE-303=====================================
  async saveOrderer(orderer) {
    let c = await sql.getRowByPkOne(
      `select count(1) as c from orderer where requests='${orderer.requests}' `
    );
    if (c.c == 0) {
      await sql.saveRow('orderer', orderer);
    }
  }
  // ====================Orderer BE-303=====================================
}

module.exports = CRUDService;
