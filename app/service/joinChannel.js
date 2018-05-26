/*
    SPDX-License-Identifier: Apache-2.0
*/

var util = require('util');
var path = require('path');
var fs = require('fs');
var hfc = require('fabric-client');
var helper = require('../helper.js');
var logger = helper.getLogger('joinChannel');
var networkService = require('./networkservice.js');
var config = require('../platform/fabric/config.json');
var orgPath = path.join(__dirname, '../config/org1.yaml');
var networkCfgPath = path.join(__dirname, '../config/network-config-tls.yaml');

/*
 * Have an organization join a channel
 */

var joinChannel = async function (channel_name, peers, org_name) {
    logger.debug('\n\n============ Join Channel start ============\n')
    var error_message = null;
    var all_eventhubs = [];
    try {
        logger.info('Calling peers in organization "%s" to join the channel', org_name);

        // first setup the client for this org
        var client = await networkService.getClientForOrg(org_name, orgPath, networkCfgPath);
        logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
        var channel = client.getChannel(channel_name);
        if (!channel) {
            let message = util.format('Channel %s was not defined in the connection profile', channel_name);
            logger.error(message);
            throw new Error(message);
        }

        // next step is to get the genesis_block from the orderer,
        // the starting point for the channel that we want to join
        let request = {
            txId: client.newTransactionID(true) //get an admin based transactionID
        };
        let genesis_block = await channel.getGenesisBlock(request);

        // tell each peer to join and wait for the event hub of each peer to tell us
        // that the channel has been created on each peer
        var promises = [];
        var block_registration_numbers = [];
        let join_request = {
            targets: peers, //using the peer names which only is allowed when a connection profile is loaded
            txId: client.newTransactionID(true), //get an admin based transactionID
            block: genesis_block
        };
        let join_promise = channel.joinChannel(join_request);
        promises.push(join_promise);
        let results = await Promise.all(promises);
        logger.debug(util.format('Join Channel R E S P O N S E : %j', results));

        // lets check the results of sending to the peers which is
        // last in the results array
        let peers_results = results.pop();
        // then each peer results
        for (let i in peers_results) {
            let peer_result = peers_results[i];
            if (peer_result.response && peer_result.response.status == 200) {
                logger.info('Successfully joined peer to the channel %s', channel_name);
            } else {
                let message = util.format('Failed to joined peer to the channel %s', channel_name);
                error_message = message;
                logger.error(message);
            }
        }
        // now see what each of the event hubs reported
        for (let i in results) {
            let event_hub_result = results[i];
            let event_hub = event_hubs[i];
            let block_registration_number = block_registration_numbers[i];
            logger.debug('Event results for event hub :%s', event_hub._ep._endpoint.addr);
            if (typeof event_hub_result === 'string') {
                logger.debug(event_hub_result);
            } else {
                if (!error_message) error_message = event_hub_result.toString();
                logger.debug(event_hub_result.toString());
            }
            event_hub.unregisterBlockEvent(block_registration_number);
        }
    } catch (error) {
        logger.error('Failed to join channel due to error: ' + error.stack ? error.stack : error);
        error_message = error.toString();
    }

    // need to shutdown open event streams
    all_eventhubs.forEach((eh) => {
        eh.disconnect();
    });

    if (!error_message) {
        let message = util.format(
            'Successfully joined peers in organization %s to the channel:%s',
            org_name, channel_name);
        logger.info(message);
        // build a response to send back to the REST caller
        let response = {
            success: true,
            message: message
        };
        return response;
    } else {
        let message = util.format('Failed to join all peers to channel. cause:%s', error_message);
        logger.error(message);
        let response = {
            success: true,
            message: message
        };
        return response;
    }
};



exports.joinChannel = joinChannel;
