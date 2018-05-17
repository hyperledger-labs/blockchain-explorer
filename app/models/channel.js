/**
 *   SPDX-License-Identifier: Apache-2.0
 */

var jch = require('../service/joinChannel.js');
var chs = require('../service/channelservice.js');


function createChannel(channelName, orgName, profile, genesisBlock) {
    let ch = chs.createChannel(channelName, orgName, profile, genesisBlock);
    return ch;
}
function joinChannel(channelName, peers, orgName) {
    let jc = jch.joinChannel(channelName, peers, orgName);
    return jc;
}

exports.createChannel = createChannel
exports.joinChannel = joinChannel