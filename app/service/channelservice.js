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
var createFabChannel = require('./createFabChannel.js');
var joinChannel = require('./joinChannel.js');
var path = require('path');
var co = require('co')
var tableName = "channel";
const util = require('util');
var logger = helper.getLogger('channelservice');
const exec = util.promisify(require('child_process').exec);
var config = require('../../appconfig.json');
var artifactChannelPath = path.join(__dirname, '../artifacts/channel');
var orgPath = path.join(__dirname, '../config/channel/org1.yaml');
var networkCfgPath = path.join(__dirname, '../config/network-config-tls.yaml');


var createChannel = async function (channelName, orgName, profile, genesisBlock) {
    var configtxgenToolPath = config.configtxgenToolPath;
    var channelConfigPath = `${artifactChannelPath}/${channelName}.tx`

    logger.debug('configtxgenToolPath: ', configtxgenToolPath)
    logger.debug('networkCfgPath: ', networkCfgPath)
    logger.debug('channelConfigPath: ', channelConfigPath)
    logger.debug('orgPath: ', orgPath)


    if (!configtxgenToolPath) {
        logger.error("Invalid, or missing configtxgenToolPath, add to config.json ", configtxgenToolPath)
    }
    try {
        let gca = await generateChannelArtifacts(channelName, orgName, profile, genesisBlock, configtxgenToolPath, channelConfigPath)

        logger.info("############### C R E A T E  C H A N N E L ###############");
        logger.info("Creating channel: " + channelName);
        logger.info("Config Path: " + channelConfigPath);
        logger.info("Org Name: " + orgName);
        logger.info("Org path to yaml file: " + orgPath);
        logger.info("Network-Config path to yaml file: " + networkCfgPath);

        let ch = await createFabChannel.createFabChannel(channelName, channelConfigPath, orgName, orgPath, networkCfgPath);
        let saveCh = await createChannel_inter(channelName);
        let response = {
            success: true,
            message: 'Successfully created channel ' + channelName
        };
        return response;

    } catch (error) {
        logger.error("generateChannelArtifacts", error)
        let response = {
            success: false,
            message: 'Failed to created channel ' + channelName
        };
        return response;
    }


}


var generateChannelArtifacts = async function (channelName, orgName, profile, genesisBlock, configtxgenToolPath, channelConfigPath) {
    const [status] = await Promise.all([
        exec(` ${configtxgenToolPath}/configtxgen -profile ${profile} -outputCreateChannelTx ${artifactChannelPath}/${channelName}.tx -channelID ${channelName} `),
        exec(` ${configtxgenToolPath}/configtxgen -profile ${genesisBlock} -outputBlock ${artifactChannelPath}/${channelName}.block `)
    ]).catch((error) => {
        logger.error(error);
        throw new Error(error);
    })
}

function* createChannel_inter(channelName) {
    yield sql.saveRow(tableName,
        {
            'name': channelName
        });
    logger.info("Create Channel: added a record to sql table");
}

exports.generateChannelArtifacts = generateChannelArtifacts
exports.createChannel = createChannel