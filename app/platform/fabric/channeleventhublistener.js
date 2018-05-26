/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var helper = require('../../helper.js')
var logger = helper.getLogger('channeleventhublistener');
var fabricClientProxy = require('./FabricClientProxy.js')
var fabricConfiguration = require('./FabricConfiguration.js')
var co = require('co')


function syncChannelEventHubBlock(saveToDatabase) {

    var fabChannels = fabricClientProxy.getChannelObjects();

    fabChannels.forEach( fabChannel => {
        var channel_event_hub = fabChannel.channelEventHub;

        channel_event_hub.connect(true);

        channel_event_hub.registerBlockEvent(
            (block) => {
                console.log('Successfully received the block event' + block);
                if (block.data != undefined) {
                    //full block	
                    co(saveToDatabase, block).then(() => {
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
    });

}
exports.syncChannelEventHubBlock = syncChannelEventHubBlock
