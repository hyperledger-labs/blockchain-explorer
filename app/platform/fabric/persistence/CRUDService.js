/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var sql = require('../../../persistence/postgreSQL/db/pgservice.js');
var helper = require('../../../helper.js')
var fs = require('fs');
var path = require('path');
var logger = helper.getLogger('CRUDService');

class CRUDService {

    constructor() {

    }


    getTxCountByBlockNum(channelName, blockNum) {
        return sql.getRowByPkOne(`select blocknum ,txcount from blocks where genesis_block_hash='${channelName}' and blocknum=${blockNum} `);
    }

    getTransactionByID(channelName, txhash) {
        let sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,t.write_set,channel.name as channelname from TRANSACTIONS as t inner join channel on t.genesis_block_hash=channel.genesis_block_hash where t.txhash = '${txhash}' `;
        return sql.getRowByPkOne(sqlTxById);
    }

    getTxList(channelName, blockNum, txid) {
        let sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelname from transactions as t  inner join channel on t.genesis_block_hash=channel.genesis_block_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} and
        t.genesis_block_hash = '${channelName}'  order by  t.id desc`;
        return sql.getRowsBySQlQuery(sqlTxList);

    }

    getBlockAndTxList(channelName, blockNum) {

        let sqlBlockTxList = ` select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and genesis_block_hash = '${channelName}' group by transactions.blockid ),
        channel.name as channelname  from blocks inner join channel on blocks.genesis_block_hash =channel.genesis_block_hash  where
         blocks.genesis_block_hash ='${channelName}' and blocknum >= ${blockNum}
         order by blocks.blocknum desc`;
        return sql.getRowsBySQlQuery(sqlBlockTxList);
    }

    async getChannelConfig(channelName) {
        let channelConfig = await sql.getRowsBySQlCase(` select * from channel where name ='${channelName}' `);
        return channelConfig;
    }

    async saveChannelRow(artifacts) {
        var channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
        var channelConfig = fs.readFileSync(artifacts.channelConfigPath);
        try {

            let insert = await sql.saveRow('channel', {
                'name': artifacts.channelName,
                'channel_hash': artifacts.channelHash,
                'channel_config': channelConfig,
                'channel_tx': channelTxArtifacts,
                'createdt': new Date()
            });

            let resp = {
                success: true,
                message: 'Channel ' + artifacts.channelName + " saved"
            };

            return resp;
        } catch (err) {
            let resp = {
                success: false,
                message: 'Faile to save channel ' + artifacts.channelName + " in database "
            };
            return resp;
        }

    }

    async saveBlock(block) {

        let c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${block.blocknum}' and txcount='${block.txcount}'
        and genesis_block_hash='${block.genesis_block_hash}' and prehash='${block.prehash}' and datahash='${block.datahash}' `)
        if (c.c == 0) {
            await sql.saveRow('blocks', block);
            await sql.updateBySql(`update channel set blocks =blocks+1 where genesis_block_hash='${block.genesis_block_hash}'`);
            return true;
        }

        return false;
    }

    async saveTransaction(transaction) {
        let c = await sql.getRowByPkOne(`select count(1) as c from transactions where blockid='${transaction.blockid}' and txhash='${transaction.txhash}' and genesis_block_hash='${transaction.genesis_block_hash}'`);

        if (c.c == 0) {
            await sql.saveRow('transactions', transaction);
            await sql.updateBySql(`update chaincodes set txcount =txcount+1 where genesis_block_hash='${transaction.genesis_block_hash}'`);
            await sql.updateBySql(`update channel set trans =trans+1 where genesis_block_hash='${transaction.genesis_block_hash}'`);
            return true;
        }

        return false;

    }


    async getCurBlockNum(channelName) {
        try {
            var row = await sql.getRowsBySQlCase(`select max(blocknum) as blocknum from blocks  where genesis_block_hash='${channelName}'`);

        } catch (err) {
            logger.error(err)
            return -1;
        }

        let curBlockNum

        if (row == null || row.blocknum == null) {
            curBlockNum = -1
        } else {
            curBlockNum = parseInt(row.blocknum)
        }

        return curBlockNum
    }

    // ====================chaincodes=====================================
    async saveChaincode(chaincode) {
        let c = await sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and genesis_block_hash='${chaincode.genesis_block_hash}' and version='${chaincode.version}' and path='${chaincode.path}'`)
        if (c.c == 0) {
            await sql.saveRow('chaincodes', chaincode)
        }
    }

    async saveChaincodPeerRef(peers_ref_chaincode) {

        let c = await sql.getRowByPkOne(`select count(1) as c from peer_ref_chaincode prc where prc.peerid= '${peers_ref_chaincode.peerid}' and prc.chaincodeid='${peers_ref_chaincode.chaincodeid}' and cc_version='${peers_ref_chaincode.cc_version}' and channelid='${peers_ref_chaincode.channelid}'`)
        if (c.c == 0) {
            await sql.saveRow('peer_ref_chaincode', peers_ref_chaincode)
        }
    }

    async saveChannel(channel) {
        let c = await sql.getRowByPkOne(`select count(1) as c from channel where name='${channel.name}' and genesis_block_hash='${channel.genesis_block_hash}'`)
        if (c.c == 0) {
            await sql.saveRow('channel', {
                "name": channel.name,
                "createdt": channel.createdt,
                "blocks": channel.blocks,
                "trans": channel.trans,
                "channel_hash": channel.channel_hash,
                "genesis_block_hash": channel.genesis_block_hash
            })
        }
    }

    async savePeer(peer) {
        let c = await sql.getRowByPkOne(`select count(1) as c from peer where genesis_block_hash='${peer.genesis_block_hash}' and server_hostname='${peer.server_hostname}' `)
        if (c.c == 0) {
            await sql.saveRow('peer', peer)
        }
    }

    async savePeerChannelRef(peers_ref_Channel) {
        let c = await sql.getRowByPkOne(`select count(1) as c from peer_ref_channel prc where prc.peerid = '${peers_ref_Channel.peerid}' and prc.channelid='${peers_ref_Channel.channelid}' `)
        if (c.c == 0) {
            await sql.saveRow('peer_ref_channel', peers_ref_Channel)
        }
    }


    async getChannelsInfo() {
        var channels = await sql.getRowsBySQlNoCondtion(` select c.id as id,c.name as channelname,c.blocks as blocks ,c.genesis_block_hash as genesis_block_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c
        group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.genesis_block_hash order by c.name `);

        return channels
    }



    // ====================Orderer BE-303=====================================
    async saveOrderer(orderer) {
        let c = await sql.getRowByPkOne(`select count(1) as c from orderer where requests='${orderer.requests}' `)
        if (c.c == 0) {
            await sql.saveRow('orderer', orderer)
        }
    }


    // ====================Orderer BE-303=====================================
}

module.exports = CRUDService;