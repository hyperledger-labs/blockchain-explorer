/**
*    SPDX-License-Identifier: Apache-2.0
*/

var co = require('co');
var fabricConfiguration = require('./FabricConfiguration.js')
var fabricClientProxy = require('./FabricClientProxy.js');


class FabricChannel {

    constructor(channelName, channel, channelEventHub) {
        this.channelName = channelName;
        this.channel = channel;
        this.channelEventHub = channelEventHub;
    }

    getPeers() {
        return channel.getPeers();
    }

}

module.exports = FabricChannel;