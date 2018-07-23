
'use strict';

var chaincodeService = require('./chaincodeService.js');
var helper = require("../../../helper.js");
var logger = helper.getLogger("RestServices");

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
        let respose;
        if (channel_genesis_hash) {
            respose = { "currentChannel": channel_genesis_hash };
        }
        else {
            respose = { "status": 1, "message": "Channel not found in the Context ", "currentChannel": "" };
        }
        logger.debug('getCurrentChannel >> %j', respose);
        return respose;
    }

    async loadChaincodeSrc(path) {
        let respose = chaincodeService.loadChaincodeSrc(path);
        logger.debug('getPeersStatus >> %s', respose);
        return respose;
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
        logger.debug('getPeersStatus >> %j', peers);
        return peers;
    }

    async changeChannel(channel_genesis_hash) {
        let client = this.platform.getDefaultClient();
        let respose = client.setDefaultChannel(channel_genesis_hash);
        logger.debug('changeChannel >> %s', respose);
        return respose;
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
        logger.debug('getChannelsInfo >> %j', currentchannels);
        return currentchannels;
    }

	async getGenesisBlockHash(channelname) {
        let client = this.platform.getDefaultClient();
        let channel_genesis_hash = client.getChannelGenHash(channelname);
		return channel_genesis_hash
	}
    getChannels() {
        let respose = this.platform.getDefaultClient().getChannelNames();
        logger.debug('getChannels >> %j', respose);
        return respose;
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