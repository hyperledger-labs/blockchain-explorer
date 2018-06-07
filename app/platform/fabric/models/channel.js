/**
 *   SPDX-License-Identifier: Apache-2.0
 */

var multer = require('multer');
const util = require('util');
var path = require('path');
var fs = require('fs');
const exec = util.promisify(require('child_process').exec);
var config = require('../config.json');
var sql = require('../../../db/pgservice.js');
var jch = require('../service/joinChannel.js');
var chs = require('../service/channelservice.js');
var requtil = require('../../../utils/requestutils.js');
var fileUtil = require('../../../utils/fileUtils.js');
var helper = require('../../../helper.js');
var configtxgenToolPath = config.configtxgenToolPath;
var logger = helper.getLogger('channel');

logger.setLevel('INFO');

/**
 * Upload channel artifacts(channel and org configuration) and call SDK for NODEjs to create a channel
 */

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/tmp');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
// set to upload 2 files, can be increased by updating array
var upload = multer({
    storage: storage
}).array('channelArtifacts', 2);


function aSyncUpload(req, res) {
    return new Promise(function (resolve, reject) {
        upload(req, res, function (err) {
            var channelTxPath = null;
            var blockPath = null;
            var channelName = req.body.channelName;
            var orgName = req.body.orgName;
            var profile = req.body.profile;
            var genesisBlock = req.body.genesisBlock;
            var configFiles = req.files;
            var channelConfigPath = null;
            var channelConfigName = null;
            var orgConfigPath = null;
            var orgConfigName = null;
            var channelHash = null;

            if (channelName && orgName && profile && configFiles) {
                channelConfigPath = configFiles[0].path;
                orgConfigPath = configFiles[1].path;
                channelConfigName = configFiles[0].originalname;
                orgConfigName = configFiles[1].originalname;

                let fileAtifacts = {
                    blockPath: blockPath,
                    channelName: channelName,
                    orgName: orgName,
                    profile: profile,
                    genesisBlock: genesisBlock,
                    configFiles: configFiles,
                    channelConfigName: channelConfigName,
                    orgConfigName: orgConfigName,
                    channelConfigPath: channelConfigPath,
                    orgConfigPath: orgConfigPath,
                    channelTxPath: "",
                    channelHash: ""
                }
                if (err) {
                    reject(err)
                }

                if (fileAtifacts)
                    resolve(fileAtifacts)
                else
                    resolve({})
            } else {
                let response = {
                    success: false,
                    message: "Invalid request, payload"
                };
                reject(response)
            }
        });
    })
}



function joinChannel(channelName, peers, orgName) {
    let jc = jch.joinChannel(channelName, peers, orgName);
    return jc;
}

var getChannelConfig = async function (channelName) {
    let channelConfig = await sql.getRowsBySQlCase(` select * from channel where name ='${channelName}' `);
    return channelConfig;
}

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



exports.getChannelConfig = getChannelConfig
exports.generateChannelArtifacts = generateChannelArtifacts
exports.joinChannel = joinChannel
exports.aSyncUpload = aSyncUpload