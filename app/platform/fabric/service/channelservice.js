/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by Cam Mach on 6/8/17.
 *
 */
var path = require('path');
var co = require('co')
var fs = require('fs');
var util = require('util');
var sql = require('../../../db/pgservice.js');
var helper = require('../../../helper.js');
var logger = helper.getLogger('channelservice');
var networkService = require('./networkservice.js');
logger.setLevel('INFO');
var tableName = "channel";

var createChannel = async function (artifacts) {
  try {
    logger.info("############### C R E A T E  C H A N N E L ###############");
    logger.info("Creating channel: " + artifacts.orgName, artifacts.orgConfigPath, artifacts.channelConfigPath);
    try {
      var client = await networkService.getClientForOrg(artifacts.orgName, artifacts.orgConfigPath,
        artifacts.channelConfigPath);
      var envelope = fs.readFileSync(artifacts.channelTxPath);
      var channelConfig = client.extractChannelConfig(envelope);
      let signature = client.signChannelConfig(channelConfig);

      let request = {
        config: channelConfig,
        signatures: [signature],
        name: artifacts.channelName,
        txId: client.newTransactionID(true)
      };

      var response = await client.createChannel(request);

      if (response && response.status === 'SUCCESS') {
        artifacts.channelHash = request.txId.getTransactionID();
        logger.info('Successfully created the channel, channel hash', artifacts.channelHash);
        let saveCh = await saveChannelRow(artifacts);
        let resp = {
          success: true,
          message: 'Successfully created channel ' + artifacts.channelName
        };
        return resp;
      } else {
        logger.error('Failed to create the channel ' + artifacts.channelName, response);
        throw new Error('Failed to create the channel ' + artifacts.channelName, response);
      }

    } catch (err) {
      logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
      throw new Error('Failed to initialize the channel: ' + err);

    }


  } catch (error) {
    logger.error("createChannel", error)
    let resp = {
      success: false,
      message: 'Failed to created channel ' + artifacts.channelName
    };
    return resp;
  }


}

var saveChannelRow = async function (artifacts) {
  var channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
  var channelConfig = fs.readFileSync(artifacts.channelConfigPath);

  let insert = await sql.saveRow(tableName,
    {
      'name': artifacts.channelName,
      'channel_hash': artifacts.channelHash,
      'channel_config': channelConfig,
      'channel_tx': channelTxArtifacts,
      'createdt': new Date()
    });
  logger.info("Create Channel: added a record to sql table");
}

exports.saveChannelRow = saveChannelRow
exports.createChannel = createChannel