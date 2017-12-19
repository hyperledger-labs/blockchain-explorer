/*
 Copyright ONECHAIN 2017 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var log4js = require('log4js');
var logger = log4js.getLogger('channelRouter');
var express = require('express');
var router = express.Router();
var query=require('../app/query.js')
var invoke=require('../app/invoke-transaction.js')
var instantiate=require('../app/instantiate-chaincode.js')
var install=require('../app/install-chaincode.js')
var config=require('../config.json')

var org =  config.org[0];

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

router.use(function(req, res, next) {

    req.orgname = req.query.orgname || org;

    console.info('=================================')
    console.info(`${req.orgname}`)

    next()
});

// Create/Update Channel
/*router.post('/channels', function(req, res) {
    var configUpdate = req.body.configUpdate;
    if (!configUpdate) {
        logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
    } else {
        logger.info('<<<<<<<<<<<<<<<<< U P D A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
    }
    var channelName = req.body.channelName;
    var channelConfigPath = req.body.channelConfigPath;
    logger.debug('Channel name : ' + channelName);
    logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!channelConfigPath) {
        res.json(getErrorMessage('\'channelConfigPath\''));
        return;
    }

    channels.createChannel(channelName, channelConfigPath, configUpdate, req.username, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});*/
// Join Channel
/*router.post('/channels/:channelName/peers', function(req, res) {
    logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
    var channelName = req.params.channelName;
    var peers = req.body.peers;
    logger.debug('channelName : ' + channelName);
    logger.debug('peers : ' + peers);
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!peers || peers.length == 0) {
        res.json(getErrorMessage('\'peers\''));
        return;
    }

    join.joinChannel(channelName, peers, req.username, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});*/
// Install chaincode on target peers
router.post('/chaincodes', function(req, res) {
    logger.debug('==================== INSTALL CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.body.chaincodeName;
    var chaincodePath = req.body.chaincodePath;
    var chaincodeVersion = req.body.chaincodeVersion;
    logger.debug('peers : ' + peers); // target peers list
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('chaincodePath  : ' + chaincodePath);
    logger.debug('chaincodeVersion  : ' + chaincodeVersion);
    if (!peers || peers.length == 0) {
        res.json(getErrorMessage('\'peers\''));
        return;
    }
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!chaincodePath) {
        res.json(getErrorMessage('\'chaincodePath\''));
        return;
    }
    if (!chaincodeVersion) {
        res.json(getErrorMessage('\'chaincodeVersion\''));
        return;
    }

    install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
// Instantiate chaincode on target peers
router.post('/channels/:channelName/chaincodes', function(req, res) {
    var isUpgrade = req.body.isupgrade;
    var peers;
    var chaincodePath;
    if (!isUpgrade){
        logger.debug('==================== INSTANTIATE CHAINCODE ==================');
    }else {
        logger.debug('==================== UPGRADE CHAINCODE ==================');
        peers = req.body.peers;
        if (!peers || peers.length == 0) {
            res.json(getErrorMessage('\'peers\''));
            return;
        }
        chaincodePath = req.body.chaincodePath;
        if (!chaincodePath) {
            res.json(getErrorMessage('\'chaincodePath\''));
            return;
        }
    }

    var chaincodeName = req.body.chaincodeName;
    var chaincodeVersion = req.body.chaincodeVersion;
    var channelName = req.params.channelName;
    var functionName = req.body.functionName;
    var args = req.body.args;
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('chaincodeVersion  : ' + chaincodeVersion);
    logger.debug('functionName  : ' + functionName);
    logger.debug('args  : ' + args);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!chaincodeVersion) {
        res.json(getErrorMessage('\'chaincodeVersion\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!functionName) {
        res.json(getErrorMessage('\'functionName\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    if (isUpgrade) {
        install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.orgname)
            .then(function(message) {
                // TODO: Avoid this hardcoding ?
                if (!message || !message.includes('Successfully Installed chaincode')) {
                    res.send('Chaincode upgarde failed while installing chaincode with version '+chaincodeVersion);
                }else {
                    instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, functionName, args, req.orgname, isUpgrade)
                        .then(function(message) {
                            res.send(message);
                        });
                }
            });
    } else {
        instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, functionName, args, req.orgname)
            .then(function(message) {
                res.send(message);
            });
    }
});
// Invoke transaction on chaincode on target peers
router.post('/channels/:channelName/chaincodes/:chaincodeName', function(req, res) {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var fcn = req.body.fcn;
    var args = req.body.args;
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args  : ' + args);
    if (!peers || peers.length == 0) {
        res.json(getErrorMessage('\'peers\''));
        return;
    }
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }

    invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
// Query on chaincode on target peers
router.get('/channels/:channelName/chaincodes/:chaincodeName', function(req, res) {
    logger.debug('==================== QUERY BY CHAINCODE ==================');
    var channelName = req.params.channelName;
    var chaincodeName = req.params.chaincodeName;
    let args = req.query.args;
    let peer = req.query.peer;
    let fcn = req.query.fcn;

    logger.debug('channelName : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args : ' + args);

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    args = args.replace(/'/g, '"');
    args = JSON.parse(args);
    logger.debug(args);

    query.queryChaincode(peer, channelName, chaincodeName, fcn, args, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
//  Query Get Block by BlockNumber
router.get('/channels/:channelName/blocks/:blockId', function(req, res) {
    logger.debug('==================== GET BLOCK BY NUMBER ==================');
    let blockId = req.params.blockId;
    let peer = req.query.peer;
    let channelName = req.params.channelName;
    logger.debug('channelName : ' + channelName);
    logger.debug('BlockID : ' + blockId);
    logger.debug('Peer : ' + peer);
    if (!blockId) {
        res.json(getErrorMessage('\'blockId\''));
        return;
    }

    query.getBlockByNumber(peer, channelName, blockId, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
// Query Get Transaction by Transaction ID
router.get('/channels/:channelName/transactions/:trxnId', function(req, res) {
    logger.debug(
        '================ GET TRANSACTION BY TRANSACTION_ID ======================'
    );

    let trxnId = req.params.trxnId;
    let peer = req.query.peer;
    let channelName = req.params.channelName;
    logger.debug('channelName : ' + channelName);
    if (!trxnId) {
        res.json(getErrorMessage('\'trxnId\''));
        return;
    }

    query.getTransactionByID(peer, channelName, trxnId, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
// Query Get Block by Hash
router.get('/channels/:channelName/blocks', function(req, res) {
    logger.debug('================ GET BLOCK BY HASH ======================');

    let hash = req.query.hash;
    let peer = req.query.peer;
    let channelName = req.params.channelName;
    logger.debug('channelName : ' + channelName);
    if (!hash) {
        res.json(getErrorMessage('\'hash\''));
        return;
    }

    query.getBlockByHash(peer, hash, req.orgname, channelName).then(
        function(message) {
            res.send(message);
        });
});
//Query for Channel Information
router.get('/channels/:channelName', function(req, res) {
    logger.debug(
        '================ GET CHANNEL INFORMATION ======================');
    let peer = req.query.peer;
    let channelName = req.params.channelName;
    logger.debug('channelName : ' + channelName);
    query.getChainInfo(peer, channelName, req.orgname).then(
        function(message) {
            res.send(message);
        });
});
// Query to fetch all Installed/instantiated chaincodes
router.get('/chaincodes', function(req, res) {
    var peer = req.query.peer;
    var installType = req.query.type;
    var channelName = req.query.channel;
    //TODO: add Constnats
    if (installType === 'installed') {
        logger.debug(
            '================ GET INSTALLED CHAINCODES ======================');
    } else {
        logger.debug(
            '================ GET INSTANTIATED CHAINCODES ======================');
    }

    query.getInstalledChaincodes(peer, channelName, installType, req.orgname)
        .then(function(message) {
            res.send(message);
        });
});
// Query to fetch channels
router.get('/channels', function(req, res) {
    logger.debug('================ GET CHANNELS ======================');
    logger.debug('peer: ' + req.query.peer);
    var peer = req.query.peer;
    if (!peer) {
        res.json(getErrorMessage('\'peer\''));
        return;
    }

    query.getChannels(peer, req.orgname)
        .then(function(
            message) {
            res.send(message);
        });
});

// Query to get BlockCount on a channel
router.get('/channels/:channelName/height', function(req, res) {
    logger.debug('================ GET BLOCK HEIGHT OF CHANNEL ======================');
    let peer = req.query.peer;
    let channelName = req.params.channelName;
    logger.debug('channelName : ' + channelName);

    query.getChannelHeight(peer, channelName, req.orgname ).then(
        function(message) {
            res.send(message);
        });
});

module.exports = router;
