/**
 *   SPDX-License-Identifier: Apache-2.0
 */

var multer = require('multer');
var jch = require('../service/joinChannel.js');
var chs = require('../service/channelservice.js');
var requtil = require('../utils/requestutils.js');
var helper = require('../helper.js');
var logger = helper.getLogger('channel');
logger.setLevel('INFO');

/**
 * Upload channel artifacts(.tx and .block files) and call SDK for NODEjs to create a channel
 */

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/tmp');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
// set to upload 2 files, can be increased by updating array
var upload = multer({ storage: storage }).array('channelArtifacts', 2);

function aSyncUpload(req, res) {
    return new Promise(function (resolve, reject) {
        upload(req, res, function (err) {
            var channelTXpath = null;
            var blockPath = null;
            var channelName = req.body.channelName;
            var orgName = req.body.orgName;
            var profile = req.body.profile;
            var genesisBlock = req.body.genesisBlock;
            var chArtifacs = req.files;
            var invalidFileType = false;

            logger.debug(channelName, orgName, profile, genesisBlock, chArtifacs)
            if (channelName && orgName && profile && genesisBlock && chArtifacs) {
                chArtifacs.forEach(function (file) {
                    if (file.originalname && file.path) {
                        if (file.originalname.endsWith('.tx')) {
                            channelTXpath = file.path
                        } else if (file.originalname.endsWith('.block')) {
                            blockPath = file.path;
                        } else {
                            invalidFileType = true;
                        }
                    }
                });

                let fileAtifacts = {
                    channelTXpath: channelTXpath,
                    blockPath: blockPath,
                    channelName: channelName,
                    orgName: orgName,
                    profile: profile,
                    genesisBlock: genesisBlock,
                    chArtifacs: chArtifacs,
                }
                if (err) {
                    reject(err)
                }

                logger.error("invalidFileType ", invalidFileType)
                if (invalidFileType) {
                    let invalidFile = {
                        success: false,
                        message: "Invalid file type, expecting: .tx, or .block type"
                    };
                    reject(invalidFile)
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
    }
    )
}



function joinChannel(channelName, peers, orgName) {
    let jc = jch.joinChannel(channelName, peers, orgName);
    return jc;
}

exports.joinChannel = joinChannel
exports.aSyncUpload = aSyncUpload
