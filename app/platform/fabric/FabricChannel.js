/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var co = require('co');

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
