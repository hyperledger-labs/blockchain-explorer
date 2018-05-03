/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by Cam Mach on 6/8/17.
 *
 */

var sql=require('../db/pgservice.js');
var helper = require('../helper.js');
var logger = helper.getLogger('channelservice');

var createFabChannel = require('./createFabChannel.js');

var co=require('co')
var tableName = "channel";

function createChannel(channelName, channelConfigPath, orgName, orgPath, networkCfgPath) {
    logger.info("############### C R E A T  C H A N N E L ###############");
    logger.info("Creating channel: " + channelName);
    logger.info("Config Path: " + channelConfigPath);
    logger.info("Org Name: " + orgName);
    logger.info("Org path to yaml file: " + orgPath);
    logger.info("Network-Config path to yaml file: " + networkCfgPath);

    co(createChannel_inter, channelName).then(objCh => {
        let message = createFabChannel.createFabChannel(channelName, channelConfigPath, orgName, orgPath, networkCfgPath);
        return message;
    }).catch(err=>{
        logger.error("Error::", err);
    })
}

function* createChannel_inter(channelName) {
    yield sql.saveRow(tableName,
        {
            'name':channelName
        });
    logger.info("Create Channel: added a record to sql table");
}

exports.createChannel=createChannel