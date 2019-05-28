/**
 *    SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable max-len */

const fs = require('fs');
const helper = require('../../common/helper');

const logger = helper.getLogger('CRUDService');

class CRUDService {
  constructor(sql) {
    this.sql = sql;
  }

  getTxCountByBlockNum(channel_genesis_hash, blockNum) {
    return this.sql.getRowByPkOne(
      `select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} `
    );
  }

  getTransactionByID(channel_genesis_hash, txhash) {
    const sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
        t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where t.txhash = '${txhash}' `;
    return this.sql.getRowByPkOne(sqlTxById);
  }

  getBlockActivityList(channel_genesis_hash) {
    const sqlBlockActivityList = `select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
      SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and
       channel_genesis_hash = '${channel_genesis_hash}' group by transactions.blockid ),
      channel.name as channelname  from blocks inner join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash  where
       blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0
       order by blocks.blocknum desc limit 3`;
    return this.sql.getRowsBySQlQuery(sqlBlockActivityList);
  }

  getTxList(channel_genesis_hash, blockNum, txid, from, to, orgs) {
    let orgsSql = '';
    if (orgs && orgs !== '') {
      orgsSql = `and t.creator_msp_id in (${orgs})`;
    }
    const sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
       inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} ${orgsSql} and
       t.channel_genesis_hash = '${channel_genesis_hash}'  and t.createdt between '${from}' and '${to}'  order by  t.id desc`;
    return this.sql.getRowsBySQlQuery(sqlTxList);
  }

  getBlockAndTxList(channel_genesis_hash, blockNum, from, to, orgs) {
    let orgsSql = '';
    if (orgs && orgs !== '') {
      orgsSql = `and creator_msp_id in (${orgs})`;
    }
    const sqlBlockTxList = `select a.* from  (
      select (select c.name from channel c where c.channel_genesis_hash =
         '${channel_genesis_hash}' ) as channelname, blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum ${orgsSql} and
         channel_genesis_hash = '${channel_genesis_hash}' and createdt between '${from}' and '${to}') from blocks where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= 0 and blocks.createdt between '${from}' and '${to}'
         order by blocks.blocknum desc)  a where  a.txhash IS NOT NULL`;
    return this.sql.getRowsBySQlQuery(sqlBlockTxList);
  }

  async getChannelConfig(channel_genesis_hash) {
    const channelConfig = await this.sql.getRowsBySQlCase(
      ` select * from channel where channel_genesis_hash ='${channel_genesis_hash}' `
    );
    return channelConfig;
  }

  async getChannel(channelname, channel_genesis_hash) {
    const channel = await this.sql.getRowsBySQlCase(
      ` select * from channel where name='${channelname}' and channel_genesis_hash='${channel_genesis_hash}' `
    );
    return channel;
  }

  async existChannel(channelname) {
    const channel = await this.sql.getRowsBySQlCase(
      ` select count(1) from channel where name='${channelname}' `
    );
    return channel;
  }

  async saveChannelRow(artifacts) {
    const channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
    const channelConfig = fs.readFileSync(artifacts.channelConfigPath);
    try {
      await this.sql.saveRow('channel', {
        name: artifacts.channelName,
        channel_hash: artifacts.channelHash,
        channel_config: channelConfig,
        channel_tx: channelTxArtifacts,
        createdt: new Date()
      });

      const resp = {
        success: true,
        message: `Channel ${artifacts.channelName} saved`
      };

      return resp;
    } catch (err) {
      const resp = {
        success: false,
        message: `Faile to save channel ${artifacts.channelName} in database `
      };
      return resp;
    }
  }

  async saveBlock(block) {
    const c = await this.sql
      .getRowByPkOne(`select count(1) as c from blocks where blocknum='${
      block.blocknum
    }' and txcount='${block.txcount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and prehash='${
      block.prehash
    }' and datahash='${block.datahash}' `);
    if (c.c == 0) {
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

  async saveTransaction(transaction) {
    const c = await this.sql.getRowByPkOne(
      `select count(1) as c from transactions where blockid='${
        transaction.blockid
      }' and txhash='${transaction.txhash}' and channel_genesis_hash='${
        transaction.channel_genesis_hash
      }'`
    );

    if (c.c == 0) {
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

  async getCurBlockNum(channel_genesis_hash) {
    let row;
    try {
      row = await this.sql.getRowsBySQlCase(
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
    const c = await this.sql
      .getRowByPkOne(`select count(1) as c from chaincodes where name='${
      chaincode.name
    }' and
        channel_genesis_hash='${chaincode.channel_genesis_hash}' and version='${
      chaincode.version
    }' and path='${chaincode.path}'`);
    if (c.c == 0) {
      await this.sql.saveRow('chaincodes', chaincode);
    }
  }

  getChannelByGenesisBlockHash(channel_genesis_hash) {
    return this.sql.getRowByPkOne(
      `select name from channel where channel_genesis_hash='${channel_genesis_hash}'`
    );
  }

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
    if (c.c == 0) {
      await this.sql.saveRow('peer_ref_chaincode', peers_ref_chaincode);
    }
  }

  async saveChannel(channel) {
    const c = await this.sql.getRowByPkOne(
      `select count(1) as c from channel where name='${
        channel.name
      }' and channel_genesis_hash='${channel.channel_genesis_hash}'`
    );
    if (c.c == 0) {
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

  async savePeer(peer) {
    // TODO: bug is here
    const c = await this.sql.getRowByPkOne(
      `select count(1) as c from peer where channel_genesis_hash='${
        peer.channel_genesis_hash
      }' and server_hostname='${peer.server_hostname}' `
    );
    if (c.c == 0) {
      await this.sql.saveRow('peer', peer);
    }
  }

  async savePeerChannelRef(peers_ref_Channel) {
    const c = await this.sql.getRowByPkOne(
      `select count(1) as c from peer_ref_channel prc where prc.peerid = '${
        peers_ref_Channel.peerid
      }' and prc.channelid='${peers_ref_Channel.channelid}' `
    );
    if (c.c == 0) {
      await this.sql.saveRow('peer_ref_channel', peers_ref_Channel);
    }
  }

  async getChannelsInfo(peerid) {
    const channels = await this.sql
      .getRowsBySQlNoCondtion(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c,
        peer_ref_channel pc where c.channel_genesis_hash = pc.channelid and pc.peerid='${peerid}' group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `);

    return channels;
  }

  // ====================Orderer BE-303=====================================
  async saveOrderer(orderer) {
    const c = await this.sql.getRowByPkOne(
      `select count(1) as c from orderer where requests='${orderer.requests}' `
    );
    if (c.c == 0) {
      await this.sql.saveRow('orderer', orderer);
    }
  }

  // ====================Orderer BE-303=====================================
}

module.exports = CRUDService;
