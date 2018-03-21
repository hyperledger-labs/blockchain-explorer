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
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('INFO');

var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');
var FabricCAService = require('fabric-ca-client');
var config = require('../config.json');
var hfc = require('fabric-client');
hfc.addConfigFile(path.join(__dirname, '../config.json'));
hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');

var clients = {};
var channels = {};
var caClients = {};

// set up the client and channel objects for each org

function createDefault(channelName) {
	for (let key in ORGS) {
		if (key.indexOf('org') === 0) {
			let client = new hfc();
			let cryptoSuite = hfc.newCryptoSuite();
			cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({ path: getKeyStoreForOrg(ORGS[key].name) }));
			client.setCryptoSuite(cryptoSuite);
			channels[key] = {};
			let channel = client.newChannel(channelName);
			clients[key] = client;
			channels[key][channelName] = channel;
			setupPeers(channel, key, client);
		}
	}
}

function setupPeers(channel, org, client) {
	for (let key in ORGS[org]) {
		if (key.indexOf('peer') === 0) {
			let peer
			if (ORGS[org][key]['tls_cacerts'] != undefined) {
				let data = fs.readFileSync(ORGS[org][key]['tls_cacerts']);
				peer = client.newPeer(
					ORGS[org][key].requests,
					{
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': ORGS[org][key]['server-hostname']
					}
				);
			} else {
				peer = client.newPeer(
					ORGS[org][key].requests
				);
			}
			channel.addPeer(peer);
		}
	}
}

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir, file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}

function getOrgName(org) {
	return ORGS[org].name;
}

function getKeyStoreForOrg(org) {
	return config.keyValueStore + '_' + org;
}

function newRemotes(urls, forPeers, userOrg, channelName) {
	var targets = [];
	// find the peer that match the urls
	outer:
	for (let index in urls) {
		let peerUrl = urls[index];
		let found = false;
		for (let key in ORGS) {
			if (key.indexOf('org') === 0) {
				// if looking for event hubs, an app can only connect to
				// event hubs in its own org
				if (!forPeers && key !== userOrg) {
					continue;
				}

				let org = ORGS[key];
				let client = getClientForOrg(key);

				for (let prop in org) {
					if (prop.indexOf('peer') === 0) {
						if (org[prop]['requests'].indexOf(peerUrl) >= 0) {
							// found a peer matching the subject url
							if (forPeers) {
								if (org[prop]['tls_cacerts'] != undefined) {
									let data = fs.readFileSync(org[prop]['tls_cacerts']);
									targets.push(client.newPeer(peerUrl, {
										pem: Buffer.from(data).toString(),
										'ssl-target-name-override': org[prop]['server-hostname']
									}));
								} else {
									targets.push(client.newPeer(peerUrl));
								}

								continue outer;
							} else {
								let eh = client.newEventHub();
								if (org[prop]['tls_cacerts'] != undefined) {
									let data = fs.readFileSync(org[prop]['tls_cacerts']);
									eh.setPeerAddr(org[prop]['events'], {
										pem: Buffer.from(data).toString(),
										'ssl-target-name-override': org[prop]['server-hostname']
									});
								} else {
									eh.setPeerAddr(org[prop]['events']);
								}
								targets.push(eh);

								continue outer;
							}
						}
					}
				}
			}
		}

		if (!found) {
			logger.error(util.format('Failed to find a peer matching the url %s', peerUrl));
		}
	}

	return targets;
}

//-------------------------------------//
// APIs
//-------------------------------------//
var getChannelForOrg = function (org, channelName) {
	if (channels[org][channelName] == undefined)
		createDefault(channelName);
	return channels[org][channelName];
};

var getClientForOrg = function (org) {
	return clients[org];
};

var newPeers = function (urls, channelName) {
	return newRemotes(urls, true, '', channelName);
};

var getMspID = function (org) {
	logger.debug('Msp ID : ' + ORGS[org].mspid);
	return ORGS[org].mspid;
};

var getOrgAdmin = function (userOrg) {
	var admin = ORGS[userOrg].admin;
	var keyPath = admin.key;
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = admin.cert;
	var certPEM = readAllFiles(certPath)[0].toString();

	var client = getClientForOrg(userOrg);
	var cryptoSuite = hfc.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({ path: getKeyStoreForOrg(getOrgName(userOrg)) }));
		client.setCryptoSuite(cryptoSuite);
	}

	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);

		return client.createUser({
			username: 'peer' + userOrg + 'Admin',
			mspid: getMspID(userOrg),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			}
		});
	});
};

var getLogger = function (moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('INFO');
	return logger;
};

var getPeerAddressByName = function (org, peer) {
	var address = ORGS[org][peer].requests;
	return address;
};

var getOrgs = function () {
	let orgList = []
	for (let key in ORGS) {
		if (key.indexOf('org') === 0) {
			orgList.push(key)
		}
	}
	return orgList
}

var getPeersByOrg = function (org) {
	let peerList = []
	for (let key in ORGS[org]) {
		if (key.indexOf('peer') === 0) {
			peerList.push(key);
		}
	}
	return peerList;
};

var getOrgMapFromConfig = function (networkConfig) {
	var orgs = Object.keys(networkConfig);
	var peerlist = [];
	orgs.forEach(ele => {
		var org = networkConfig[ele];
		var properties = Object.keys(org);
		properties.forEach(prop => {
			if (typeof org[prop] === 'object' && 'requests' in org[prop] && 'events' in org[prop]
				&& 'server-hostname' in org[prop] && 'tls_cacerts' in org[prop])
				peerlist.push({
					key: ele,
					value: prop
				});
		});
	});

	return peerlist;
}

exports.getChannelForOrg = getChannelForOrg;
exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.getMspID = getMspID;
exports.ORGS = ORGS;
exports.newPeers = newPeers;
exports.getPeerAddressByName = getPeerAddressByName;
exports.getOrgAdmin = getOrgAdmin;
exports.getOrgs = getOrgs;
exports.getPeersByOrg = getPeersByOrg;
exports.createDefault = createDefault;
exports.getOrgMapFromConfig = getOrgMapFromConfig;