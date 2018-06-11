/*
    SPDX-License-Identifier: Apache-2.0
*/

const util = require('util');
var path = require('path');
const exec = util.promisify(require('child_process').exec);
var config = require('../config.json');
var fileUtil = require('./utils/fileUtils.js');
var helper = require('../../../helper.js');
var configtxgenToolPath = config.configtxgenToolPath;
var fs = require('fs');
var logger = helper.getLogger('channelservice');
logger.setLevel('INFO');
var networkService = require('./networkservice.js');




var generateChannelArtifacts = async function (artifacts) {
    let artifactsDir = await fileUtil.generateDir();
    var artifactChannelPath = path.resolve(artifactsDir);
    let channelTxPath = `${artifactChannelPath}/${artifacts.channelName}.tx`;
    let channelBlockPath = `${artifactChannelPath}/${artifacts.channelName}.block`;
    logger.info(` ${configtxgenToolPath}/configtxgen -profile ${artifacts.profile} -outputCreateChannelTx ${channelTxPath} -channelID ${artifacts.channelName} `)
    logger.info(` ${configtxgenToolPath}/configtxgen -profile ${artifacts.genesisBlock} -outputBlock ${channelBlockPath} `)

    const [status] = await Promise.all([
        exec(` ${configtxgenToolPath}/configtxgen -profile ${artifacts.profile} -outputCreateChannelTx ${channelTxPath} -channelID ${artifacts.channelName} `),
        exec(` ${configtxgenToolPath}/configtxgen -profile ${artifacts.genesisBlock} -outputBlock ${channelBlockPath} `)
    ]).catch((error) => {
        logger.error(error);
        throw new Error(error);
    })
    let channelArtifacts = {
        channelTxPath: channelTxPath,
        channelBlockPath: channelBlockPath
    }

    return channelArtifacts;
}




async function createAndSave(artifacts, platform) {
  try {
        platform.createChannel(artifacts);

        var crudService = platform.getCrudService();

        if (response && response.status === 'SUCCESS') {
            artifacts.channelHash = request.txId.getTransactionID();
            logger.info('Successfully created the channel, channel hash', artifacts.channelHash);
            let saveCh = await crudService.saveChannelRow(artifacts);
            let resp = {
            success: true,
            message: 'Successfully created channel ' + artifacts.channelName
            };
            return resp;
        } else {
            logger.error('Failed to create the channel ' + artifacts.channelName, response);
            throw new Error('Failed to create the channel ' + artifacts.channelName, response);
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


async function createChannel(artifacts, platform) {
    try {
        if (artifacts) {
            if (artifacts.channelName && artifacts.profile && artifacts.genesisBlock) {
                // generate genesis block and channel transaction             //
                let channelGenesis = await generateChannelArtifacts(artifacts, crudService);
                artifacts.channelTxPath = channelGenesis.channelTxPath;
                try {
                    let channelCreate = await createAndSave(artifacts);
                    res.send(channelCreate)
                } catch (err) {
                    res.send({ success: false, message: err })
                }
            } else {
                    let response = {
                        success: false,
                        message: "Invalid request " + artifacts
                    };
                    return response;
            }
        } else {
            res.send({ success: false, message: 'no artifacts' })
        }

    } catch (err) {
                logger.error(err)
                return res.send({ success: false, message: "Invalid request, payload" });
    }

}

exports.createChannel = createChannel