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
var helper = require('./helper.js');
var logger = helper.getLogger('Query');
var fabricClientProxy = require('./FabricClientProxy.js');
var configuration = require('./FabricConfiguration.js');

var FabricCAService = require('fabric-ca-client');

var peerFailures = 0;
var queryChaincode = function (peer, channelName, chaincodeName, fcn, args, org) {
	var channel = fabricClientProxy.getChannelForOrg(org);
	var client = fabricClientProxy.getClientForOrg(org);

	var target = buildTarget(peer, org);
	//Let Cahnnel use second peer added
	if (peerFailures > 0) {
		let peerToRemove = channel.getPeers()[0];
		channel.removePeer(peerToRemove);
		channel.addPeer(peerToRemove);
	}
	tx_id = client.newTransactionID();
	// send query
	var request = {
		chaincodeId: chaincodeName,
		txId: tx_id,
		fcn: fcn,
		args: args
	};
	return channel.queryByChaincode(request, target);
};

var getBlockByNumber = function (peer, channelName, blockNumber, org) {
	var target = buildTarget(peer, org);
	var channel = fabricClientProxy.getChannelForOrg(org);
	return channel.queryBlock(parseInt(blockNumber), target).then((channelinfo) => {
		if (channelinfo) {
			return channelinfo;
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


var getTransactionByID = function (peer, channelName, trxnID, org) {
	if (trxnID) {

	var target = buildTarget(peer, org);
	var channel = fabricClientProxy.getChannelForOrg(org);
	return channel.queryTransaction(trxnID, target);
	}
	return {};

};
var getBlockByHash = function (peer, hash, org) {
	var target = buildTarget(peer, org);
	var channel = fabricClientProxy.getChannelForOrg(org);
	return channel.queryBlockByHash(new Buffer(hash, "hex"), target);
};
var getChainInfo = function (peer, channelName, org) {
	var target = buildTarget(peer, org);
	var client = fabricClientProxy.getClientForOrg(org);
	var channel = fabricClientProxy.getChannelForOrg(org, channelName);
	return channel.queryInfo(target, true).then((blockchainInfo) => {
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

//getInstalledChaincodes
var getInstalledChaincodes = function (peer, channelName, type, org) {
	var target = buildTarget(peer, org);
	var client = fabricClientProxy.getClientForOrg(org);
	var channel = fabricClientProxy.getChannelForOrg(org, channelName);
	return (function() {
		if (type === 'installed') {
			return client.queryInstalledChaincodes(target, true);
		} else {
			return channel.queryInstantiatedChaincodes(target, true);
		}
	}()).then((response) => {
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				let detail = {}
				logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
				detail.name = response.chaincodes[i].name
				detail.version = response.chaincodes[i].version
				detail.path = response.chaincodes[i].path
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

var getOrganizations = function (org, channelName) {
	var channel = fabricClientProxy.getChannelForOrg(org, channelName);
	return channel.getOrganizations();
};

var getChannels = function (peer, org) {
	var target = buildTarget(peer, org);
	var client = fabricClientProxy.getClientForOrg(org);
	return client.queryChannels(target).then((channelinfo) => {
		if (channelinfo) {
			return channelinfo;
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

var getPeerList = function (org, channelName) {
	var client = fabricClientProxy.getClientForOrg(org);
	var channel = fabricClientProxy.getChannelForOrg(org);
	return channel.getPeers();
};

var getChannelHeight = function (peer, channelName, org) {
	return getChainInfo(peer, channelName, org).then(response => {
		if (response) {
			logger.debug('<<<<<<<<<< channel height >>>>>>>>>')
			if (response.height.low) {
				logger.debug("response.height.low ", response.height.low);
				return response.height.low.toString()
			}
			return "0";
		}
	})
}

function buildTarget(peer, org) {
	var target = null;
	if (typeof peer !== 'undefined') {
		let targets = fabricClientProxy.newPeers([configuration.getPeerAddressByName(org, peer)]);
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
exports.getChannelHeight = getChannelHeight;
exports.getPeerList = getPeerList;
exports.getOrganizations = getOrganizations;