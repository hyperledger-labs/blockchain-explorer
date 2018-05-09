/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var helper = require('../helper.js')
var logger = helper.getLogger('channeleventhublistener');
var fabricClientProxy = require('../FabricClientProxy.js')
var config = require('../../config.json')
var co = require('co')
var blockScanner = require('../service/blockscanner.js')
var networkConfig = config["network-config"];
var org = Object.keys(networkConfig)[0];

function syncChannelEventHubBlock() {
    var channel_event_hub = fabricClientProxy.getChannelEventHub(org);
    console.log("syncEvent-block--" + channel_event_hub)
    var client = fabricClientProxy.getClientForOrg(org)
    channel_event_hub.connect(true);

    channel_event_hub.registerBlockEvent(
        (block) => {
            console.log('Successfully received the block event' + block);
            if (block.data != undefined) {
                //full block	
                co(blockScanner.saveBlockRange, block).then(() => {
                    console.log("success block in Event")
                }).catch(err => {
                    console.log(err.stack);
                    logger.error(err)
                })
            } else {
                //filtered block
                console.log('The block number' + block.number);
                console.log('The filtered_tx' + block.filtered_tx);
                console.log('The block event channel_id' + block.channel_id);
            }
        },
        (error) => {
            console.log('Failed to receive the block event ::' + error);
        }
    );
}
exports.syncChannelEventHubBlock = syncChannelEventHubBlock
