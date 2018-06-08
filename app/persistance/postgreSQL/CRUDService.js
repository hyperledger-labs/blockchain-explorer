/**
*    SPDX-License-Identifier: Apache-2.0
*/

var sql = require('./db/pgservice.js');
var helper = require('../../helper.js')
var logger = helper.getLogger('blockscanner');
var asn = require('asn1.js');
var sha = require('js-sha256');


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

        let insert = await sql.saveRow('channel',
          {
            'name': artifacts.channelName,
            'channel_hash': artifacts.channelHash,
            'channel_config': channelConfig,
            'channel_tx': channelTxArtifacts,
            'createdt': new Date()
          });
        logger.info("Create Channel: added a record to sql table");
      }

    async saveBlockRange(block) {
        let first_tx = block.data.data[0]; //get the first Transaction
        let header = first_tx.payload.header; //the "header" object contains metadata of the transaction
        let channelName = header.channel_header.channel_id;
        let blockNum = block.header.number;
        let firstTxTimestamp = header.channel_header.timestamp;
        let preHash = block.header.previous_hash;
        let dataHash = block.header.data_hash;
        let txCount = block.data.data.length;
        if (!firstTxTimestamp) {
            firstTxTimestamp = null
        }

        let headerAsn = asn.define('headerAsn', function () {
            this.seq().obj(this.key('Number').int(),
                this.key('PreviousHash').octstr(), this.key('DataHash').octstr());
        });

        let output = headerAsn.encode({
            Number: parseInt(blockNum),
            PreviousHash: Buffer.from(preHash, 'hex'),
            DataHash: Buffer.from(dataHash, 'hex')
        }, 'der');

        let blockhash = sha.sha256(output);

        let c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${blockNum}' and txcount='${txCount}' and prehash='${preHash}' and datahash='${dataHash}' and channelname='${channelName}' `)
        if (c.c == 0) {
            await sql.saveRow('blocks',
                {
                    'blocknum': blockNum,
                    'channelname': channelName,
                    'prehash': preHash,
                    'datahash': dataHash,
                    'blockhash':blockhash,
                    'txcount': txCount,
                    'createdt': new Date(firstTxTimestamp)
                })
            //push last block
            var notify = {
                'title': 'Block ' + block.header.number + ' Added',
                'type': 'block',
                'message': 'Block ' + block.header.number + ' established with ' + block.data.data.length + ' tx',
                'time': new Date(firstTxTimestamp),
                'txcount': block.data.data.length,
                'datahash': block.header.data_hash
            };
            wss.broadcast(notify);

            //////////chaincode//////////////////
            //syncChaincodes();
            //////////tx/////////////////////////
            let txLen = block.data.data.length
            for (let i = 0; i < txLen; i++) {
                let tx = block.data.data[i]
                let chaincode
                try {
                    chaincode = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].namespace
                } catch (err) {
                    chaincode = ""
                }

                let rwset
                let readSet
                let writeSet
                try {
                    rwset = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset
                    readSet = rwset.map(i => { return { 'chaincode': i.namespace, 'set': i.rwset.reads } })
                    writeSet = rwset.map(i => { return { 'chaincode': i.namespace, 'set': i.rwset.writes } })
                } catch (err) {
                }

                let chaincodeID
                try {
                    let chaincodeID =
                        new Uint8Array(tx.payload.data.actions[0].payload.action.proposal_response_payload.extension)
                } catch (err) {
                }

                let status
                try {
                    status = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.status
                } catch (err) {
                }

                let mspId = []

                try {
                    mspId = tx.payload.data.actions[0].payload.action.endorsements.map(i => { return i.endorser.Mspid })
                } catch (err) {
                }

                await sql.saveRow('transaction',
                    {
                        'channelname': channelName,
                        'blockid': block.header.number.toString(),
                        'txhash': tx.payload.header.channel_header.tx_id,
                        'createdt': new Date(tx.payload.header.channel_header.timestamp),
                        'chaincodename': chaincode,
                        'chaincode_id': String.fromCharCode.apply(null, chaincodeID),
                        'status': status,
                        'creator_msp_id': tx.payload.header.signature_header.creator.Mspid,
                        'endorser_msp_id': mspId,
                        'type': tx.payload.header.channel_header.typeString,
                        'read_set': JSON.stringify(readSet, null, 2),
                        'write_set': JSON.stringify(writeSet, null, 2)
                    })

                await sql.updateBySql(`update chaincodes set txcount =txcount+1 where name = '${chaincode}' and channelname='${channelName}' `)
            }
        }
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

        let c = await sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' and channelname='${chaincode.channelName}' `)
        if (c.c == 0) {
            await sql.saveRow('chaincodes', chaincode)
        }
    }


    async saveChannel(channel) {
        let c = await sql.getRowByPkOne(`select count(1) as c from channel where name='${channel.name}'`)
        if (c.c == 0) {
            await sql.saveRow('channel', { "name": channel.name, "createdt": channel.createdt, "blocks": channel.blocks, "trans": channel.trans, "channel_hash": channel.channel_hash })
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