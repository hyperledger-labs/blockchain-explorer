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
logger.setLevel('ERROR');

var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');
var FabricCAService = require('fabric-ca-client');
var config = require('../config.json');

var hfc = require('fabric-client');
if(config.enableTls){
	hfc.addConfigFile(path.join(__dirname, 'network-config-tls.json'));
}else{
	hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
}
hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');

var clients = {};
var channels = {};
var caClients = {};

// set up the client and channel objects for each org
for (let key in ORGS) {
    if (key.indexOf('org') === 0) {
        let client = new hfc();

        let cryptoSuite = hfc.newCryptoSuite();
        cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(ORGS[key].name)}));
        client.setCryptoSuite(cryptoSuite);
        channels[key] = {};
        for (let index in config.channelsList) {
            let channelName = config.channelsList[index];
            let channel = client.newChannel(channelName);
            //Add all the orderers
            newOrderer(client, channel)
            clients[key] = client;
            channels[key][channelName] = channel;

            setupPeers(channel, key, client);
        }
        let caUrl = ORGS[key].ca;
        caClients[key] = new FabricCAService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, cryptoSuite);
    }
}

function setupPeers(channel, org, client) {
	for (let key in ORGS[org]) {
		if (key.indexOf('peer') === 0) {
            let peer
			if(config.enableTls){
                let data = fs.readFileSync(path.join(__dirname,"../", ORGS[org][key]['tls_cacerts']));
                peer = client.newPeer(
                    ORGS[org][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                    }
                );
			}else{
				peer = client.newPeer(
					ORGS[org][key].requests
				);
			}

			channel.addPeer(peer);
		}
	}
}

function newOrderer(client, channel) {
	for (let index in ORGS['orderer']) {
        let newOrderer
		if(config.enableTls){
            let data = fs.readFileSync(path.join(__dirname,"../", ORGS.orderer[index]['tls_cacerts']));
            newOrderer = client.newOrderer(
                ORGS.orderer[index].url,
                {
                    pem: Buffer.from(data).toString(),
                    'ssl-target-name-override': ORGS.orderer[index]['server-hostname']
                }
            );
		}else{
			newOrderer = client.newOrderer(
				ORGS.orderer[index].url
			);
		}
		channel.addOrderer(newOrderer);
	}
}

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir,file_name);
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
								if(config.enableTls){
                                    let data = fs.readFileSync(path.join(__dirname,"../", org[prop]['tls_cacerts']));
                                    targets.push(client.newPeer('grpcs://' + peerUrl, {
                                        pem: Buffer.from(data).toString(),
                                        'ssl-target-name-override': org[prop]['server-hostname']
                                    }));
								}else{
									targets.push(client.newPeer('grpc://' + peerUrl));
								}

								continue outer;
							} else {
								let eh = client.newEventHub();
								if(config.enableTls){
                                    let data = fs.readFileSync(path.join(__dirname,"../", org[prop]['tls_cacerts']));
                                    eh.setPeerAddr(org[prop]['events'], {
                                        pem: Buffer.from(data).toString(),
                                        'ssl-target-name-override': org[prop]['server-hostname']
                                    });
								}else{
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
var getChannelForOrg = function(org, channelName) {
    if (channelName == undefined ) {
        channelName = config.channelsList[0];
    }
    return channels[org][channelName];
};

var getClientForOrg = function(org) {
	return clients[org];
};

var newPeers = function(urls,channelName) {
	return newRemotes(urls, true,'',channelName);
};

var newEventHubs = function(urls, org,channelName) {
	return newRemotes(urls, false, org,channelName);
};

var getMspID = function(org) {
	logger.debug('Msp ID : ' + ORGS[org].mspid);
	return ORGS[org].mspid;
};

var getAdminUser = function(userOrg) {
	var users = config.users;
	var username = users[0].username;
	var password = users[0].secret;
	var member;
	var client = getClientForOrg(userOrg);

	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(username, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				// need to enroll it with CA server
				return caClient.enroll({
					enrollmentID: username,
					enrollmentSecret: password
				}).then((enrollment) => {
					logger.info('Successfully enrolled user \'' + username + '\'');
					member = new User(username);
					member.setCryptoSuite(client.getCryptoSuite());
					return member.setEnrollment(enrollment.key, enrollment.certificate, getMspID(userOrg));
				}).then(() => {
					return client.setUserContext(member);
				}).then(() => {
					return member;
				}).catch((err) => {
					logger.error('Failed to enroll and persist user. Error: ' + err.stack ?
						err.stack : err);
					return null;
				});
			}
		});
	});
};

var getRegisteredUsers = function(username, userOrg, isJson) {
	var member;
	var client = getClientForOrg(userOrg);
	var enrollmentSecret = null;
	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(username, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				return getAdminUser(userOrg).then(function(adminUserObj) {
					member = adminUserObj;
					return caClient.register({
						enrollmentID: username,
						affiliation: userOrg + '.department1'
					}, member);
				}).then((secret) => {
					enrollmentSecret = secret;
					logger.debug(username + ' registered successfully');
					return caClient.enroll({
						enrollmentID: username,
						enrollmentSecret: secret
					});
				}, (err) => {
					logger.debug(username + ' failed to register');
					return '' + err;
					//return 'Failed to register '+username+'. Error: ' + err.stack ? err.stack : err;
				}).then((message) => {
					if (message && typeof message === 'string' && message.includes(
							'Error:')) {
						logger.error(username + ' enrollment failed');
						return message;
					}
					logger.debug(username + ' enrolled successfully');

					member = new User(username);
					member._enrollmentSecret = enrollmentSecret;
					return member.setEnrollment(message.key, message.certificate, getMspID(userOrg));
				}).then(() => {
					client.setUserContext(member);
					return member;
				}, (err) => {
					logger.error(util.format('%s enroll failed: %s', username, err.stack ? err.stack : err));
					return '' + err;
				});;
			}
		});
	}).then((user) => {
		if (isJson && isJson === true) {
			var response = {
				success: true,
				secret: user._enrollmentSecret,
				message: username + ' enrolled Successfully',
			};
			return response;
		}
		return user;
	}, (err) => {
		logger.error(util.format('Failed to get registered user: %s, error: %s', username, err.stack ? err.stack : err));
		return '' + err;
	});
};

var getOrgAdmin = function(userOrg) {
	var admin = ORGS[userOrg].admin;
	var keyPath = path.join(__dirname,"../",admin.key);
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = path.join(__dirname,"../",admin.cert);
	var certPEM = readAllFiles(certPath)[0].toString();

	var client = getClientForOrg(userOrg);
	var cryptoSuite = hfc.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(getOrgName(userOrg))}));
		client.setCryptoSuite(cryptoSuite);
	}

	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);

		return client.createUser({
			username: 'peer'+userOrg+'Admin',
			mspid: getMspID(userOrg),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			}
		});
	});
};

var setupChaincodeDeploy = function() {
	process.env.GOPATH = path.join(__dirname, config.GOPATH);
};

var getLogger = function(moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

var getPeerAddressByName = function(org, peer) {
	var address = ORGS[org][peer].requests;
	if(config.enableTls){
        return address.split('grpcs://')[1];
	}
	return address.split('grpc://')[1];
};

var getOrgs=function(){
	let orgList=[]
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

exports.getChannelForOrg = getChannelForOrg;
exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getMspID = getMspID;
exports.ORGS = ORGS;
exports.newPeers = newPeers;
exports.newEventHubs = newEventHubs;
exports.getPeerAddressByName = getPeerAddressByName;
exports.getRegisteredUsers = getRegisteredUsers;
exports.getOrgAdmin = getOrgAdmin;
exports.getAdminUser=getAdminUser;
exports.getOrgs=getOrgs;
exports.getPeersByOrg=getPeersByOrg;
