
'use strict';

var chaincodeService = require('./chaincodeService.js');

class RestServices {

    constructor(platform, persistence, broadcaster, ) {
        this.platform = platform;
        this.persistence = persistence;
        this.broadcaster = broadcaster;
    }

    async getCurrentChannel() {

        let client = this.platform.getDefaultClient();
        let channel = client.getDefaultChannel();
        let channel_genesis_hash = client.getChannelGenHash(channel.getName());
        if (channel_genesis_hash) {
            return { "currentChannel": channel_genesis_hash };
        }
        else {
            return { "status": 1, "message": "Channel not found in the Context ", "currentChannel": "" };
        }
    }

    async loadChaincodeSrc(path) {
        return chaincodeService.loadChaincodeSrc(path);
    }
    async getPeersStatus(channel_genesis_hash) {

        let nodes = await this.persistence.getMetricService().getPeerList(channel_genesis_hash);
        let peers = [];

        let client = this.platform.getDefaultClient();

        for (let node of nodes) {
            if (node.peer_type === "PEER") {
                let res = await client.getPeerStatus(node);
                node.status = res.status;
                peers.push(node);
            }
        }
        return peers;
    }
    async changeChannel(channel_genesis_hash) {

        let client = this.platform.getDefaultClient();
        return client.setDefaultChannel(channel_genesis_hash);

    }

    async getChannelsInfo() {

        let channels = await this.persistence.getCrudService().getChannelsInfo();
        let client = this.platform.getDefaultClient();
        let currentchannels = [];

        for (var channel of channels) {

            let channel_genesis_hash = client.getChannelGenHash(channel.channelname);
            if (channel_genesis_hash && channel_genesis_hash === channel.genesis_block_hash) {
                currentchannels.push(channel);
            }

        }
        //console.log(JSON.stringify(currentchannels));
        return currentchannels;
    }

    getChannels() {
        return this.platform.getDefaultClient().getChannelNames();
    }

    getPlatform() {
        return this.platform;
    }

    getPersistence() {
        return this.persistence;
    }

    getBroadcaster() {
        return this.broadcaster;
    }

}

module.exports = RestServices;