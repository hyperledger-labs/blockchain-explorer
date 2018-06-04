/*
*SPDX-License-Identifier: Apache-2.0
*/

var fabricConfiguration = require('../platform/fabric/FabricConfiguration.js')

var helper = require('../helper.js')
var co = require('co')
var logger = helper.getLogger('blockscanner');
var sql = require('../db/pgservice.js');
var wss = require('../../main.js');


class BlockScanner {

    constructor(platform) {
        this.proxy =  platform.getDefaultProxy();
    }

    async syncBlock() {
        try {
            var channels =  this.proxy.getChannels();

            for(let channelName of channels)
            {
                let maxBlockNum
                let curBlockNum
                [maxBlockNum, curBlockNum] = await Promise.all([
                    this.getMaxBlockNum(channelName),
                    this.getCurBlockNum(channelName)
                ]);

                await this.getBlockByNumber(channelName, curBlockNum + 1, maxBlockNum);
            };
        } catch (err) {
        console.log(err);
        }
    }

    async getBlockByNumber(channelName, start, end) {
        while (start < end) {
            let block = await this.proxy.getBlockByNumber(channelName, start)

            try {
                await this.saveBlockRange(block)
            }
            catch(err) {
                console.log(err.stack);
                logger.error(err)
            }
            start++
        }
    }

    async saveBlockRange(block) {
        let first_tx = block.data.data[0]; //get the first Transaction
        let header = first_tx.payload.header; //the "header" object contains metadata of the transaction
        let channelName = header.channel_header.channel_id;
        let blockNum = block.header.number.toString();
        let firstTxTimestamp = header.channel_header.timestamp;
        let preHash = block.header.previous_hash;
        let dataHash = block.header.data_hash;
        let txCount = block.data.data.length;
        if (!firstTxTimestamp) {
            firstTxTimestamp = null
        }

        let c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${blockNum}' and txcount='${txCount}' and prehash='${preHash}' and datahash='${dataHash}' and channelname='${channelName}' `)
        if (c.c == 0) {
            await sql.saveRow('blocks',
                {
                    'blocknum': block.header.number,
                    'channelname': channelName,
                    'prehash': block.header.previous_hash,
                    'datahash': block.header.data_hash,
                    'txcount': block.data.data.length,
                    'createdt': new Date(firstTxTimestamp)
                })
            //push last block
            var notify = {
                'title': 'Block '+block.header.number + ' Added',
                'type': 'block',
                'message': 'Block ' + block.header.number + ' established with ' + block.data.data.length + ' tx',
                'time': new Date(firstTxTimestamp),
                'txcount': block.data.data.length,
                'datahash':block.header.data_hash
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


    async getMaxBlockNum(channelName) {
        try {
            var data = await this.proxy.getChannelHeight(channelName);
            return data;
        } catch(err) {
            logger.error(err)
        }
    }

    async getCurBlockNum(channelName) {
        try {
        var row = await sql.getRowsBySQlCase(`select max(blocknum) as blocknum from blocks  where channelname='${channelName}'`);

        } catch(err) {
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
    async saveChaincodes(channelName) {
        let chaincodes = await this.proxy.getInstalledChaincodes(channelName, 'Instantiated')
        let len = chaincodes.length
        if (typeof chaincodes === 'string') {
            logger.debug(chaincodes)
            return
        }
        for (let i = 0; i < len; i++) {
            let chaincode = chaincodes[i]
            chaincode.channelname = channelName
            let c = await sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' and channelname='${channelName}' `)
            if (c.c == 0) {
                await sql.saveRow('chaincodes', chaincode)
            }
        }

    }

    async saveChannel() {
        var channels  = this.proxy.getChannels();

        for (let i = 0; i < channels.length; i++) {
            let date = new Date()
            var channel = {
                blocks: 0,
                trans: 0,
                name: channels[i],
                createdt: date,
                channel_hash: ''
            };
            channel.blocks = await this.proxy.getChannelHeight(channel.name)
            for (let j = 0; j < channel.blocks; j++) {
                let block = await this.proxy.getBlockByNumber(channel.name, j)
                channel.trans += block.data.data.length
                if(j==0){
                    channel.createdt = new Date(block.data.data[0].payload.header.channel_header.timestamp)
                }
                if (j == channel.blocks - 1) {
                    channel.channel_hash = block.data.data[block.data.data.length - 1].payload.header.channel_header.tx_id
                }
            }
            let c = await sql.getRowByPkOne(`select count(1) as c from channel where name='${channel.name}'`)
            if (c.c == 0) {
                await sql.saveRow('channel', { "name": channel.name, "createdt": channel.createdt, "blocks": channel.blocks, "trans": channel.trans, "channel_hash": channel.channel_hash })
            } else {
                await sql.updateBySql(`update channel set blocks='${channel.blocks}',trans='${channel.trans}',channel_hash='${channel.channel_hash}' where name='${channel.name}'`)
            }
        }
    }

    async syncChannels() {
        try {
            await this.saveChannel();
        }catch(err) {
            logger.error(err)
        }
    }

    async savePeerlist(channelName) {

        var peerlists = await this.proxy.getConnectedPeers(channelName);

        let peerlen = peerlists.length
        for (let i = 0; i < peerlen; i++) {
            var peers = {};
            let peerlist = peerlists[i]
            peers.name = channelName;
            peers.requests = peerlist._url;
            peers.server_hostname = peerlist._options["grpc.default_authority"];
            let c = await sql.getRowByPkOne(`select count(1) as c from peer where name='${peers.name}' and requests='${peers.requests}' `)
            if (c.c == 0) {
                await sql.saveRow('peer', peers)
            }
        }
    }

    syncChaincodes() {
        var channelName = fabricConfiguration.getCurrChannel();

        try {
            this.saveChaincodes(channelName);
        } catch(err) {
            logger.error(err)
        }
    }

    syncPeerlist() {
        var channelName = fabricConfiguration.getCurrChannel();

        try {
            this.savePeerlist(channelName);
        } catch(err) {
            logger.error(err)
        }
    }

	syncChannelEventHubBlock() {
        this.proxy.syncChannelEventHubBlock(this.saveBlockRange);
    }
}

module.exports = BlockScanner;