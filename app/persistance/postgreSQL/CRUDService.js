/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var sql = require('./db/pgservice.js');
var helper = require('../../helper.js')
var fs = require('fs');
var path = require('path');
var logger = helper.getLogger('blockscanner');

class CRUDService {

    constructor() {

    }


    getTxCountByBlockNum(channelName, blockNum) {
        return sql.getRowByPkOne(`select blocknum ,txcount from blocks where channelname='${channelName}' and blocknum=${blockNum} `);
    }

    getTransactionByID(channelName, txhash) {
        let sqlTxById = ` select * from TRANSACTION where txhash = '${txhash}' `;
        return sql.getRowByPkOne(sqlTxById);
    }

    getTxList(channelName, blockNum, txid) {
        let sqlTxList = ` select * from transaction where  blockid >= ${blockNum} and id >= ${txid} and
         channelname = '${channelName}'  order by  transaction.id desc`;
        return sql.getRowsBySQlQuery(sqlTxList);

    }

    getBlockAndTxList(channelName, blockNum) {

        let sqlBlockTxList = ` select blocks.*,(
        SELECT  array_agg(txhash) as txhash FROM transaction where blockid = blocks.blocknum and channelname = blocks.channelname group by transaction.blockid )  from blocks where
         blocks.channelname ='${channelName}' and blocknum >= ${blockNum}
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

        let c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${block.blockNum}' and txcount='${block.txCount}' and prehash='${block.preHash}' and datahash='${block.dataHash}' and channelname='${block.channelName}' `)
        if (c.c == 0) {
            await sql.saveRow('blocks', {
                'blocknum': block.blockNum,
                'channelname': block.channelName,
                'prehash': block.preHash,
                'datahash': block.dataHash,
                'blockhash': block.blockhash,
                'txcount': block.txCount,
                'createdt': new Date(block.firstTxTimestamp)
            });

            return true;
        }

        return false;
    }

    async saveTransaction(transaction) {
        await sql.saveRow('transaction', transaction);
        await sql.updateBySql(`update chaincodes set txcount =txcount+1 where name = '${transaction.chaincodename}' and channelname='${transaction.channelname}' `);
    }


    async getCurBlockNum(channelName) {
        try {
            var row = await sql.getRowsBySQlCase(`select max(blocknum) as blocknum from blocks  where channelname='${channelName}'`);

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
        let c = await sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' and channelname='${chaincode.channelname}' `)
        if (c.c == 0) {
            await sql.saveRow('chaincodes', chaincode)
        }
    }


    async saveChannel(channel) {
        let c = await sql.getRowByPkOne(`select count(1) as c from channel where name='${channel.name}'`)
        if (c.c == 0) {
            await sql.saveRow('channel', {
                "name": channel.name,
                "createdt": channel.createdt,
                "blocks": channel.blocks,
                "trans": channel.trans,
                "channel_hash": channel.channel_hash
            })
        } else {
            await sql.updateBySql(`update channel set blocks='${channel.blocks}',trans='${channel.trans}',channel_hash='${channel.channel_hash}' where name='${channel.name}'`)
        }
    }

    async savePeer(peer) {
        let c = await sql.getRowByPkOne(`select count(1) as c from peer where name='${peer.name}' and requests='${peer.requests}' `)
        if (c.c == 0) {
            await sql.saveRow('peer', peer)
        }
    }
}

module.exports = CRUDService;