/*
*SPDX-License-Identifier: Apache-2.0
*/

var helper = require('../../helper.js')
var logger = helper.getLogger('blockscanner');
var sha = require('js-sha256');
var asn = require('asn1.js');

class BlockScanner {

    constructor(platform, persistance) {
        this.proxy = platform.getDefaultProxy();
        this.crudService = persistance.getCrudService();
    }

    async syncBlock() {
        try {
            var channels = this.proxy.getChannels();

            for (let channelName of channels) {
                let maxBlockNum
                let curBlockNum
                [maxBlockNum, curBlockNum] = await Promise.all([
                    this.getMaxBlockNum(channelName),
                    this.crudService.getCurBlockNum(channelName)
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
                await this.crudService.saveBlockRange(block)
            }
            catch (err) {
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

        let output = headerAsn.encode({ Number: parseInt(header.number), PreviousHash: Buffer.from(header.previous_hash, 'hex'), DataHash: Buffer.from(header.data_hash, 'hex') }, 'der');
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
        for (let i = 0; i < len; i++) {
            let chaincode = chaincodes[i]
            chaincode.channelname = channelName;
            this.crudService.saveChaincode(chaincode);
        }

    }

    async saveChannel() {
        var channels = this.proxy.getChannels();

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

        let peerlen = peerlists.length
        for (let i = 0; i < peerlen; i++) {
            var peers = {};
            let peerlist = peerlists[i]
            peers.name = channelName;
            peers.requests = peerlist._url;
            peers.server_hostname = peerlist._options["grpc.default_authority"];

            this.crudService.savePeer(peers);
        }
    }

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

    syncChannelEventHubBlock() {
        var crud = this.crudService;
        this.proxy.syncChannelEventHubBlock(block => { crud.saveBlockRange(block); } );
    }
}

module.exports = BlockScanner;