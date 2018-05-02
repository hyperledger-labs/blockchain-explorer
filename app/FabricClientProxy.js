 /**
 *    SPDX-License-Identifier: Apache-2.0
 */
var ledgerMgr = require('./utils/ledgerMgr.js');
var log4js = require('log4js');
var path = require('path');
var logger = log4js.getLogger('FabricClientProxy');
var helper = require('./helper.js')
var configuration = require('./FabricConfiguration.js')
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');


logger.setLevel('INFO');
var hfc = require('fabric-client');
hfc.addConfigFile(path.join(__dirname, '../config.json'));
hfc.setLogger(logger);


class FabricClientProxy {

	constructor(channelName) {

		this.channelName = channelName;

		this.clients = {};
		this.channels = {};
		this.caClients = {};

		this.createDefault();

	}

	getChannelForOrg(org) {
		if (this.channels[org][this.channelName] == undefined)
			createDefault(this.channelName);
		return this.channels[org][this.channelName];
	};

	getClientForOrg(org) {
		return this.clients[org];
	};


	newRemotes(urls, forPeers, userOrg) {
		var targets = [];
		// find the peer that match the urls
		outer:
		for (let index in urls) {
			let peerUrl = urls[index];
			let found = false;

			var orgs = configuration.getOrgs();
			for(let key of orgs) {
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

		client.createUser({
			username: 'peer' + org + 'Admin',
			mspid: configuration.getMspID(org),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			},
			skipPersistence: true
		}).then( admin => {
			client.setAdminSigningIdentity(keyPEM, certPEM, configuration.getMspID(org));
		}, err => {
			throw err;
		});
	}


	// set up the client and channel objects for each org
	createDefault()
	{
		configuration.getOrgs().forEach(key => {
				let client = new hfc();
				let cryptoSuite = hfc.newCryptoSuite();
				cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({ path: configuration.getKeyStoreForOrg(configuration.getOrg(key).name) }));
				client.setCryptoSuite(cryptoSuite);
				this.channels[key] = {};
				let channel = client.newChannel(this.channelName);
				//For each client setup a admin user as signining identity
				this.setAdminForClient(key, client);
				//For each client setup a default state store
				hfc.newDefaultKeyValueStore({
					path: configuration.getKeyStoreForOrg(configuration.getOrgName(key))
				}).then(store => {
					client.setStateStore(store);
				});
				//Now clients are available for use.
				this.clients[key] = client;
				this.channels[key][this.channelName] = channel;
				this.setupPeers(channel, key, client);
		});
	}

	setupPeers(channel, org, client)
	{
		configuration.getPeersByOrg(org).forEach( key => {
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
				channel.addPeer(peer);
		});
	}
}



module.exports = new FabricClientProxy(ledgerMgr.getCurrChannel());
