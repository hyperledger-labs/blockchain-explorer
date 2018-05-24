/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by Cam Mach on 6/8/17.
 *
 */

var sql = require('../db/pgservice.js');
var helper = require('../helper.js');
var logger = helper.getLogger('channelservice');
logger.setLevel('INFO');
var createFabChannel = require('./createFabChannel.js');
var joinChannel = require('./joinChannel.js');
var path = require('path');
var co = require('co')
var tableName = "channel";
const util = require('util');

var orgPath = path.join(__dirname, '../config/org1.yaml');
var networkCfgPath = path.join(__dirname, '../config/network-config-tls.yaml');


var createChannel = async function (channelName, orgName, profile, genesisBlock, channelTXpath) {
    logger.debug('channelTXpath: ', channelTXpath)
    logger.debug('orgPath: ', orgPath)

    try {
        logger.info("############### C R E A T E  C H A N N E L ###############");
        logger.info("Creating channel: " + channelName);
        logger.info("Config Path: " + channelTXpath);
        logger.info("Org Name: " + orgName);
        logger.info("Org path to yaml file: " + orgPath);
        logger.info("Network-Config path to yaml file: " + networkCfgPath);

        let ch = await createFabChannel.createFabChannel(channelName, channelTXpath, orgName, orgPath, networkCfgPath);
        let saveCh = await createChannel_inter(channelName);
        let response = {
            success: true,
            message: 'Successfully created channel ' + channelName
        };
        return response;

    } catch (error) {
        logger.error("createChannel", error)
        let response = {
            success: false,
            message: 'Failed to created channel ' + channelName
        };
        return response;
    }


}

function* createChannel_inter(channelName) {
    yield sql.saveRow(tableName,
        {
            'name': channelName
        });
    logger.info("Create Channel: added a record to sql table");
}

exports.createChannel = createChannel