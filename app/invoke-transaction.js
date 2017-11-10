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
'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('invoke-chaincode');
var EventHub = require('fabric-client/lib/EventHub.js');
if(config.enableTls){
	hfc.addConfigFile(path.join(__dirname, 'network-config-tls.json'));
}else{
	hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
}
var ORGS = hfc.getConfigSetting('network-config');

var invokeChaincode = function(peersUrls, channelName, chaincodeName, fcn, args, username, org) {
    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));
    var client = helper.getClientForOrg(org);
    var channel = helper.getChannelForOrg(org, channelName);
    var targets = helper.newPeers(peersUrls);
    var tx_id = null;

    tx_id = client.newTransactionID();
    logger.debug(util.format('Sending transaction "%j"', tx_id));
    // send proposal to endorser
    var request = {
        targets: targets,
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args,
        chainId: channelName,
        txId: tx_id
    };
    return channel.sendTransactionProposal(request);
};

exports.invokeChaincode = invokeChaincode;