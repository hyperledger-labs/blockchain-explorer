/*
 *SPDX-License-Identifier: Apache-2.0
 */

var helper = require('../../helper.js')
var logger = helper.getLogger('blockscanner');
var fileUtil = require('../rest/logical/utils/fileUtils.js');
var dateUtils = require("../rest/logical/utils/dateUtils.js");
var BlockDecoder = require('fabric-client/lib/BlockDecoder.js')

class BlockScanner {

    constructor(platform, persistance, broadcaster) {
        this.proxy = platform.getDefaultProxy();
        this.crudService = persistance.getCrudService();
        this.broadcaster = broadcaster;
    }

    async syncBlock() {
        try {
            // sync block data historicaly
            var syncStartDate = this.proxy.getSyncStartDate();
            var channels = this.proxy.getChannels();

            for (let channelName of channels) {
                let maxBlockNum;
                let curBlockNum;
                [maxBlockNum, curBlockNum] = await Promise.all([
                    this.getMaxBlockNum(channelName),
                    this.crudService.getCurBlockNum(channelName)
                ]);

                if (syncStartDate) {
                    await this.syncBlocksFromDate(channelName, maxBlockNum, syncStartDate);
                } else {
                    await this.getBlockByNumber(channelName, curBlockNum + 1, maxBlockNum);
                }
            };
        } catch (err) {
            console.log(err);
        }
    }

    async getBlockTimeStamp(block) {
        var blockTimestamp = null;
        try {
            if (block && block.data && block.data.data[0]) {
                let first_tx = block.data.data[0];
                let header = first_tx.payload.header;
                blockTimestamp = header.channel_header.timestamp;
            }
        } catch (err) {
            logger.error(err)
        }
        return blockTimestamp;
    };
    async saveBlockRange(block) {

        let first_tx = block.data.data[0]; //get the first Transaction
        let header = first_tx.payload.header; //the "header" object contains metadata of the transaction
        let firstTxTimestamp = header.channel_header.timestamp;
        if (!firstTxTimestamp) {
            firstTxTimestamp = null
        }
        let genesisBlock =  await this.proxy.getGenesisBlock()
       let temp = BlockDecoder.decodeBlock(genesisBlock)
        let genesisBlockHash = await fileUtil.generateBlockHash(temp.header)
        let blockhash = await fileUtil.generateBlockHash(block.header);
        var blockRecord = {
            'blockNum': block.header.number,
            'txCount': block.data.data.length,
            'preHash': block.header.previous_hash,
            'dataHash': block.header.data_hash,
            'channelName': header.channel_header.channel_id,
            'firstTxTimestamp': header.channel_header.timestamp,
            'blockhash': blockhash,
            'genesis_block_hash': genesisBlockHash
        };

        var blockSaved = await this.crudService.saveBlock(blockRecord);

        if (blockSaved) {

            //push last block
            var notify = {
                'title': 'Block ' + block.header.number + ' Added',
                'type': 'block',
                'message': 'Block ' + block.header.number + ' established with ' + block.data.data.length + ' tx',
                'time': new Date(firstTxTimestamp),
                'txcount': block.data.data.length,
                'datahash': block.header.data_hash
            };

            this.broadcaster.broadcast(notify);

            await this.saveTransactions(block);

        }
    }

    async saveTransactions(block) {
        //////////chaincode//////////////////
        //syncChaincodes();
        //////////tx/////////////////////////
        let first_tx = block.data.data[0]; //get the first Transaction
        let header = first_tx.payload.header; //the "header" object contains metadata of the transaction
        let channelName = header.channel_header.channel_id;

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
                readSet = rwset.map(i => {
                    return {
                        'chaincode': i.namespace,
                        'set': i.rwset.reads
                    }
                })
                writeSet = rwset.map(i => {
                    return {
                        'chaincode': i.namespace,
                        'set': i.rwset.writes
                    }
                })
            } catch (err) {}

            let chaincodeID
            try {
                chaincodeID =
                    new Uint8Array(tx.payload.data.actions[0].payload.action.proposal_response_payload.extension)
            } catch (err) {}

            let status
            try {
                status = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.status
            } catch (err) {}

            let mspId = []

            try {
                mspId = tx.payload.data.actions[0].payload.action.endorsements.map(i => { return i.endorser.Mspid })
            } catch (err) {
            }
            let genesisBlock =  await this.proxy.getGenesisBlock()
            let temp = BlockDecoder.decodeBlock(genesisBlock)
             let genesisBlockHash = await fileUtil.generateBlockHash(temp.header)
            var transaction = {
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
                'write_set': JSON.stringify(writeSet, null, 2),
                'genesis_block_hash' : genesisBlockHash
            };

            await this.crudService.saveTransaction(transaction);

        }

    }

    /**
     *
     * @param {*} channelName
     * @param {*} maxBlockNum
     * @param {*} syncStartDate
     * Method provides the ability to sync based on configured property syncStartDate in config.json
     */
    async syncBlocksFromDate(channelName, maxBlockNum, syncStartDate) {
        var applyFilter = syncStartDate ? true : false;
        var saveRecord = true;
        var END = 0;
        var START = maxBlockNum - 1;
        // get blocks backwards
        while (END <= START) {
            saveRecord = false;
            try {
                let block = await this.proxy.getBlockByNumber(channelName, START)
                if (block && applyFilter) {
                    let blockTimeStamp = await this.getBlockTimeStamp(block);
                    let blockUTC = dateUtils.toUTCmilliseconds(blockTimeStamp);

                    if (blockUTC && syncStartDate) {
                        if (blockUTC >= syncStartDate) {
                            saveRecord = true;
                        } else {
                            saveRecord = false;
                        }
                    }
                }
                if (saveRecord) {
                    try {
                        var savedNewBlock = await this.saveBlockRange(block)
                        if (savedNewBlock) {
                            this.broadcaster.broadcast();
                        }
                    } catch (err) {
                        console.log(err.stack);
                        logger.error(err)
                    }
                }
            } catch (err) {
                logger.error(err)
            }
            // decrease the block number
            START--
        }
    }
    async getBlockByNumber(channelName, start, end) {
        while (start < end) {
            let block = await this.proxy.getBlockByNumber(channelName, start)

            try {
                var savedNewBlock = await this.saveBlockRange(block)
                if (savedNewBlock) {
                    this.broadcaster.broadcast();
                }
            } catch (err) {
                console.log(err.stack);
                logger.error(err)
            }
            start++
        }
    }

    calculateBlockHash(header) {
        let headerAsn = asn.define('headerAsn', function () {
            this.seq().obj(this.key('Number').int(), this.key('PreviousHash').octstr(), this.key('DataHash').octstr());
        });

        let output = headerAsn.encode({
            Number: parseInt(header.number),
            PreviousHash: Buffer.from(header.previous_hash, 'hex'),
            DataHash: Buffer.from(header.data_hash, 'hex')
        }, 'der');
        let hash = sha.sha256(output);
        return hash;
    };



    async getMaxBlockNum(channelName) {
        try {
            var data = await this.proxy.getChannelHeight(channelName);
            return data;
        } catch (err) {
            logger.error(err)
        }
    }


    // ====================chaincodes=====================================
    async saveChaincodes(channelName) {
        let chaincodes = await this.proxy.getInstalledChaincodes(channelName, 'Instantiated')
        let len = chaincodes.length
        if (typeof chaincodes === 'string') {
            logger.debug(chaincodes)
            return
        }
        let genesisBlock =  await this.proxy.getGenesisBlock()
        let temp = BlockDecoder.decodeBlock(genesisBlock)
         let genesisBlockHash = await fileUtil.generateBlockHash(temp.header)
        for (let i = 0; i < len; i++) {
            let chaincode = chaincodes[i]
            chaincode.channelname = channelName;
            chaincode.genesis_block_hash = genesisBlockHash
            this.crudService.saveChaincode(chaincode);
        }

    }

    async saveChannel() {
        var channels = this.proxy.getChannels();
        let genesisBlock =  await this.proxy.getGenesisBlock()
        let temp = BlockDecoder.decodeBlock(genesisBlock)
         let genesisBlockHash = await fileUtil.generateBlockHash(temp.header)
        for (let i = 0; i < channels.length; i++) {
            let date = new Date()
            var channel = {
                blocks: 0,
                trans: 0,
                name: channels[i],
                createdt: date,
                channel_hash: '',
                genesis_block_hash:genesisBlockHash
            };
            channel.blocks = await this.proxy.getChannelHeight(channel.name)
            for (let j = 0; j < channel.blocks; j++) {
                let block = await this.proxy.getBlockByNumber(channel.name, j)
                channel.trans += block.data.data.length
                if (j == 0) {
                    channel.createdt = new Date(block.data.data[0].payload.header.channel_header.timestamp)
                }
                if (j == channel.blocks - 1) {
                    channel.channel_hash = block.data.data[block.data.data.length - 1].payload.header.channel_header.tx_id
                }
            }

            this.crudService.saveChannel(channel);
        }
    }

    async syncChannels() {
        try {
            await this.saveChannel();
        } catch (err) {
            logger.error(err)
        }
    }

    async savePeerlist(channelName) {

        var peerlists = await this.proxy.getConnectedPeers(channelName);
        let genesisBlock =  await this.proxy.getGenesisBlock()
        let temp = BlockDecoder.decodeBlock(genesisBlock)
         let genesisBlockHash = await fileUtil.generateBlockHash(temp.header)
        let peerlen = peerlists.length
        for (let i = 0; i < peerlen; i++) {
            var peers = {};
            let peerlist = peerlists[i]
            peers.name = channelName;
            peers.requests = peerlist._url;
            peers.genesis_block_hash = genesisBlockHash;
            peers.server_hostname = peerlist._options["grpc.default_authority"];
            this.crudService.savePeer(peers);
        }
    }
    // ====================Orderer BE-303=====================================
    async saveOrdererlist(channelName) {

        var ordererlists = await this.proxy.getConnectedOrderers(channelName);
        let ordererlen = ordererlists.length
        for (let i = 0; i < ordererlen; i++) {
            var orderers = {};
            let ordererlist = ordererlists[i]
            orderers.requests = ordererlist._url;
            orderers.server_hostname = ordererlist._options["grpc.default_authority"];
            this.crudService.saveOrderer(orderers);
        }
    }
    // ====================Orderer BE-303=====================================
    async syncChaincodes() {

        try {
            var channels = this.proxy.getChannels();

            for (let channelName of channels) {
                this.saveChaincodes(channelName);
            }

        } catch (err) {
            logger.error(err)
        }
    }

    syncPeerlist() {

        try {
            var channels = this.proxy.getChannels();

            for (let channelName of channels) {
                this.savePeerlist(channelName);
            }

        } catch (err) {
            logger.error(err)
        }
    }
    // ====================Orderer BE-303=====================================
    syncOrdererlist() {

        try {
            var channels = this.proxy.getChannels();
            for (let channelName of channels) {
                this.saveOrdererlist(channelName);
            }
        } catch (err) {
            logger.error(err)
        }
    }
    // ====================Orderer BE-303=====================================
    syncChannelEventHubBlock() {
        var self = this;
        this.proxy.syncChannelEventHubBlock(block => {
            self.saveBlockRange(block);
        });
    }
}

module.exports = BlockScanner;