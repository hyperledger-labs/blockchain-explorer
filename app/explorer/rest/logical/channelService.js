/*
    SPDX-License-Identifier: Apache-2.0
*/

const util = require('util');
var path = require('path');
const exec = util.promisify(require('child_process').exec);
var config = require('../../../platform/fabric/config.json');
var fileUtil = require('./utils/fileUtils.js');
var helper = require('../../../helper.js');
var configtxgenToolPath = config.configtxgenToolPath;
var fs = require('fs');
var logger = helper.getLogger('channelservice');
logger.setLevel('INFO');

var generateChannelArtifacts = async function(artifacts) {
  let artifactsDir = await fileUtil.generateDir();
  var artifactChannelPath = path.resolve(artifactsDir);
  let channelTxPath = `${artifactChannelPath}/${artifacts.channelName}.tx`;
  let channelBlockPath = `${artifactChannelPath}/${
    artifacts.channelName
  }.block`;
  logger.info(
    ` ${configtxgenToolPath}/configtxgen -profile ${
      artifacts.profile
    } -outputCreateChannelTx ${channelTxPath} -channelID ${
      artifacts.channelName
    } `
  );
  logger.info(
    ` ${configtxgenToolPath}/configtxgen -profile ${
      artifacts.genesisBlock
    } -outputBlock ${channelBlockPath} `
  );

  const [status] = await Promise.all([
    exec(
      ` ${configtxgenToolPath}/configtxgen -profile ${
        artifacts.profile
      } -outputCreateChannelTx ${channelTxPath} -channelID ${
        artifacts.channelName
      } `
    ),
    exec(
      ` ${configtxgenToolPath}/configtxgen -profile ${
        artifacts.genesisBlock
      } -outputBlock ${channelBlockPath} `
    )
  ]).catch(error => {
    logger.error(error);
    throw new Error(error);
  });
  let channelArtifacts = {
    channelTxPath: channelTxPath,
    channelBlockPath: channelBlockPath
  };
  return channelArtifacts;
};

async function createAndSave(artifacts, platform, crudService) {
  try {
    let response = await platform.createChannel(artifacts);
    if (response && response.status === 'SUCCESS' && response.txId) {
      artifacts.channelHash = response.txId;
      logger.info(
        'Successfully created the channel, channel hash',
        artifacts.channelHash
      );
      let saveCh = await crudService.saveChannelRow(artifacts);
      let resp = {
        success: true,
        message: 'Successfully created channel ' + artifacts.channelName
      };
      return resp;
    } else {
      logger.error(
        'Failed to create the channel ' + artifacts.channelName,
        response
      );
      let resp = {
        success: false,
        message: response.info
          ? response.info
          : 'Failed to create the channel ' + artifacts.channelName
      };
      return resp;
    }
  } catch (error) {
    logger.error('createAndSave', error);
    let resp = {
      success: false,
      message: 'Failed to created channel ' + artifacts.channelName
    };
    return resp;
  }
}

async function createChannel(artifacts, platform, crudService) {
  try {
    if (
      artifacts &&
      artifacts.channelName &&
      artifacts.profile &&
      artifacts.genesisBlock
    ) {
      // generate genesis block and channel transaction             //
      let channelGenesis = await generateChannelArtifacts(
        artifacts,
        crudService
      );
      artifacts.channelTxPath = channelGenesis.channelTxPath;
      try {
        let createChannelAndSave = await createAndSave(
          artifacts,
          platform,
          crudService
        );
        let chResp = {
          success: createChannelAndSave.success,
          message: createChannelAndSave.message
        };
        return chResp;
      } catch (err) {
        let response = {
          success: false,
          message: err
        };
        return response;
      }
    } else {
      logger.debug('artifacts ', artifacts);
      let response = {
        success: false,
        message: 'Invalid request '
      };
      return response;
    }
  } catch (err) {
    logger.error('createChannel ', err);
    let response = {
      success: false,
      message: 'Invalid request, payload'
    };
    return response;
  }
}

exports.createAndSave = createAndSave;
exports.createChannel = createChannel;
exports.generateChannelArtifacts = generateChannelArtifacts;
