/**
 * Copyright 2017 ONECHAIN All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Query');

var peerFailures = 0;
var queryChaincode = function(peer, channelName, chaincodeName, fcn, args, username, org) {
    var channel = helper.getChannelForOrg(org, channelName);
    var client = helper.getClientForOrg(org, channelName);

    var target = buildTarget(peer, org);
    //Let Cahnnel use second peer added
    if (peerFailures > 0) {
        let peerToRemove = channel.getPeers()[0];
        channel.removePeer(peerToRemove);
        channel.addPeer(peerToRemove);
    }

    return helper.getRegisteredUsers(username, org).then((user) => {
        tx_id = client.newTransactionID();
        // send query
        var request = {
            chaincodeId: chaincodeName,
            txId: tx_id,
            fcn: fcn,
            args: args
        };
        return channel.queryByChaincode(request, target);
    }, (err) => {
        logger.info('Failed to get submitter \'' + username + '\'');
        return 'Failed to get submitter \'' + username + '\'. Error: ' + err.stack ? err.stack :
            err;
    }).then((response_payloads) => {
        var isPeerDown = response_payloads[0].toString().indexOf('Connect Failed') > -1 || response_payloads[0].toString().indexOf('REQUEST_TIMEOUT') > -1
        if (isPeerDown && peerFailures < 3) {
            peerFailures++;
            logger.debug(' R E T R Y - ' + peerFailures);
            queryChaincode('peer2', channelName, chaincodeName, fcn, args, username, org);
        } else {
            if (isPeerDown) {
                return 'After 3 retries, peer couldn\' t recover '
            }
            if (response_payloads) {
                peerFailures = 0;
                for (let i = 0; i < response_payloads.length; i++) {
                    logger.info('Query Response ' + response_payloads[i].toString('utf8'));
                    return response_payloads[i].toString('utf8');
                }
            } else {
                logger.error('response_payloads is null');
                return 'response_payloads is null';
            }
        }
    }, (err) => {
        logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
    }).catch((err) => {
        logger.error('Failed to end to end test with error:' + err.stack ? err.stack :
            err);
        return 'Failed to end to end test with error:' + err.stack ? err.stack :
            err;
    });
};

var getBlockByNumber = function(peer,channelName, blockNumber, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org,channelName);

	return helper.getRegisteredUsers(username, org).then((member) => {
		return channel.queryBlock(parseInt(blockNumber), target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			//logger.debug(response_payloads);
			// logger.debug(response_payloads);
			return response_payloads; //response_payloads.data.data[0].buffer;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};


var getTransactionByID = function(peer,channelName, trxnID, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org,channelName);

	return helper.getRegisteredUsers(username, org).then((member) => {
		return channel.queryTransaction(trxnID, target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			 logger.debug(response_payloads);
			return response_payloads;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};
var getBlockByHash = function(peer, hash, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org);

	return helper.getRegisteredUsers(username, org).then((member) => {
		return channel.queryBlockByHash(new Buffer(hash,"hex"), target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			// logger.debug(response_payloads);
			return response_payloads;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};
var getChainInfo = function(peer,channelName, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org,channelName);

	return helper.getRegisteredUsers(username, org).then((member) => {
		return channel.queryInfo(target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((blockchainInfo) => {
		if (blockchainInfo) {
			// FIXME: Save this for testing 'getBlockByHash'  ?
			logger.debug('===========================================');
			logger.debug(blockchainInfo.currentBlockHash);
			logger.debug('===========================================');
			//logger.debug(blockchainInfo);
			return blockchainInfo;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};

var getChannelConfig=function(org,channelName){
    var channel = helper.getChannelForOrg(org,channelName);

    return helper.getOrgAdmin(org).then((member) => {
        return channel.getChannelConfig()
    }).then((response) => {
        return response
    }).catch((err) => {
        logger.error(err)
    });

}
//getInstalledChaincodes
var getInstalledChaincodes = function(peer,channelName, type, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org,channelName);
	var client = helper.getClientForOrg(org);

	return helper.getOrgAdmin(org).then((member) => {
		if (type === 'installed') {
			return client.queryInstalledChaincodes(target);
		} else {
			return channel.queryInstantiatedChaincodes(target);
		}
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				let detail={}
				logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
                detail.name=response.chaincodes[i].name
				detail.version=response.chaincodes[i].version
				detail.path=response.chaincodes[i].path
                details.push(detail);
			}
			return details;
		} else {
			logger.error('response is null');
			return 'response is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};
var getChannels = function(peer, username, org) {
	var target = buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

	return helper.getRegisteredUsers(username, org).then((member) => {
		//channel.setPrimaryPeer(targets[0]);
		return client.queryChannels(target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			logger.debug('<<< channels >>>');
			var channelNames = [];
			for (let i = 0; i < response.channels.length; i++) {
				channelNames.push('channel id: ' + response.channels[i].channel_id);
			}
			logger.debug(channelNames);
			return response;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};

var getChannelHeight=function(peer,channelName,username,org){
	return getChainInfo(peer,channelName,username,org).then(response=>{
		if(response){
			logger.debug('<<<<<<<<<< channel height >>>>>>>>>')
			logger.debug(response.height.low)
			return response.height.low.toString()
		}
	})
}

function buildTarget(peer, org) {
	var target = null;
	if (typeof peer !== 'undefined') {
		let targets = helper.newPeers([helper.getPeerAddressByName(org, peer)]);
		if (targets && targets.length > 0) target = targets[0];
	}

	return target;
}

exports.queryChaincode = queryChaincode;
exports.getBlockByNumber = getBlockByNumber;
exports.getTransactionByID = getTransactionByID;
exports.getBlockByHash = getBlockByHash;
exports.getChainInfo = getChainInfo;
exports.getInstalledChaincodes = getInstalledChaincodes;
exports.getChannels = getChannels;
exports.getChannelHeight=getChannelHeight;
exports.getChannelConfig=getChannelConfig;