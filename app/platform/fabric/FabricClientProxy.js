/**
*    SPDX-License-Identifier: Apache-2.0
*/

var log4js = require('log4js');
var path = require('path');
var logger = log4js.getLogger('FabricClientProxy');
var helper = require('../../helper.js')
var configuration = require('./FabricConfiguration.js')
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');
logger.setLevel('INFO');
var hfc = require('fabric-client');
hfc.addConfigFile(path.join(__dirname, './config.json'));
hfc.setLogger(logger);

class FabricClientProxy {

	constructor(channelName) {
		this.clients = {};
		this.channels = {};
		this.caClients = {};
		this.channelEventHubs = {};
		this.peers = [];
		this.createDefault();
	}

	modifyChannelObj(org) {
		if (this.channels[org][configuration.getCurrChannel()] == undefined) {
			this.createDefault();
			return true;
		} else {
			return false;
		}
	}

	getChannelForOrg(org) {
		if (this.channels[org][configuration.getCurrChannel()] == undefined)
			this.createDefault();
		return this.channels[org][configuration.getCurrChannel()];
	};

	getClientForOrg(org) {
		return this.clients[org];
	};

	getChannelEventHub(org) {
		var client = this.getClientForOrg(org)
		this.setupPeers(null, org, client, true);
		var channel = this.getChannelForOrg(org);
		if (this.channelEventHubs[org][this.peers[0]] == undefined) {

			var channel_event_hub = channel.newChannelEventHub(this.peers[0]);
			this.channelEventHubs[org][this.peers[0]] = channel_event_hub;
		}
		return this.channelEventHubs[org][this.peers[0]];
	}

	newRemotes(urls, forPeers, userOrg) {
		var targets = [];
		// find the peer that match the urls
		outer:
		for (let index in urls) {
			let peerUrl = urls[index];
			let found = false;

			var orgs = configuration.getOrgs();
			for (let key of orgs) {
				// if looking for event hubs, an app can only connect to
				// event hubs in its own org
				if (!forPeers && key !== userOrg) {
					return;
				}
				let org = configuration.getOrg(key);
				let client = this.getClientForOrg(key);

				var peers = configuration.getPeersByOrg(key);

				for (let prop of peers) {
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
						}

						continue outer;

					}
				}
			}
			if (!found) {
				logger.error(util.format('Failed to find a peer matching the url %s', peerUrl));
			}
		}
		return targets;
	}

	newPeers(urls) {
		return this.newRemotes(urls, true, '');
	};

	setAdminForClient(org, client) {
		var admin = configuration.getOrg(org).admin;
		var keyPath = admin.key;
		var keyPEM = Buffer.from(helper.readAllFiles(keyPath)[0]).toString();
		var certPath = admin.cert;
		var certPEM = helper.readAllFiles(certPath)[0].toString();

		var user = client.createUser({
			username: 'peer' + org + 'Admin',
			mspid: configuration.getMspID(org),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			},
			skipPersistence: false
		}).then(admin => {
			client.setAdminSigningIdentity(keyPEM, certPEM, configuration.getMspID(org));
		}, err => {
			console.log("error-admin--" + err.stack)
			throw err;
		});
		return user;
	}

	// set up the client and channel objects for each org
	createDefault() {
		configuration.getOrgs().forEach(key => {
			let channelName = configuration.getCurrChannel();
			let client = new hfc();
			let cryptoSuite = hfc.newCryptoSuite();
			cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({ path: configuration.getKeyStoreForOrg(configuration.getOrg(key).name) }));
			client.setCryptoSuite(cryptoSuite);
			this.channels[key] = {};
			this.channelEventHubs[key] = {};
			this.peers = [];
			let channel = client.newChannel(channelName);
			//Now clients are available for use.
			this.clients[key] = client;
			//For each client setup a admin user as signining identity
			this.setAdminForClient(key, client);
			hfc.newDefaultKeyValueStore({
				path: configuration.getKeyStoreForOrg(configuration.getOrgName(key))
			}).then(store => {
				client.setStateStore(store);
			});
			this.channels[key][channelName] = channel;
			this.setupPeers(channel, key, client, false);
			for (let peer of this.peers) {
				var channel_event_hub = channel.newChannelEventHub(peer);
				this.channelEventHubs[key][peer] = channel_event_hub;
			}
		});
	}

	setupPeers(channel, org, client, isReturn) {
		configuration.getPeersByOrg(org).forEach(key => {
			let peer
			if (configuration.getOrg(org)[key]['tls_cacerts'] != undefined) {
				let data = fs.readFileSync(configuration.getOrg(org)[key]['tls_cacerts']);
				peer = client.newPeer(
					configuration.getOrg(org)[key].requests,
					{
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': configuration.getOrg(org)[key]['server-hostname']
					}
				);
			} else {
				peer = client.newPeer(
					configuration.getOrg(org)[key].requests
				);
			}
			this.peers.push(peer);
			if (!isReturn)
				channel.addPeer(peer);
		});
	}
}

module.exports = new FabricClientProxy();
