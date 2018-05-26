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
var FabricChannel = require('./FabricChannel.js');
logger.setLevel('INFO');
var hfc = require('fabric-client');
hfc.addConfigFile(path.join(__dirname, './config.json'));
hfc.setLogger(logger);

class FabricClientProxy {

	constructor(channelName) {
		this.clients = {};
		this.channels = {};
		this.caClients = {};
		this.peers = {};
		this.createDefault();
	}

	getDefaultPeer()
	{
		return this.peers[[configuration.getDefaultOrg(), configuration.getDefaultPeer()]];
	}

	getChannel(channelName) {
		return this.channels[channelName].channel;
	}

	getChannels() {
		return Object.keys(this.channels);
	}

	getChannelObjects() {
		return Object.values(this.channels);
	}


	getChannelEventHub(channelName) {
		return this.channels[channelName].channelEventHub;
	}


	getClientForOrg(org) {
		return this.clients[org];
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

			this.clients[key] = client;
			//For each client setup a admin user as signining identity
			this.setAdminForClient(key, client);
			hfc.newDefaultKeyValueStore({
				path: configuration.getKeyStoreForOrg(configuration.getOrgName(key))
			}).then(store => {
				client.setStateStore(store);
			});

			this.setupPeers(key, client, false);
		});

		var that = this;
		setTimeout (function () {
			that.setChannels();
		}, 1000);

	}

	setupPeers(org, client, isReturn) {
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

			this.peers[[org, key]] = peer;
		});
	}


	async setChannels() {

		var client = this.getClientForOrg(configuration.getDefaultOrg());
		var channelInfo =  await this.queryChannels(configuration.getDefaultPeer(), configuration.getDefaultOrg());

		channelInfo.channels.forEach( chan => {
			var channelName = chan.channel_id;
			let channel = client.newChannel(channelName);
			channel.addPeer(this.getDefaultPeer());
			var channel_event_hub = channel.newChannelEventHub(this.getDefaultPeer());
			this.channels[channelName] = new FabricChannel(channelName, channel, channel_event_hub);
		});

	}

	queryChannels(peer, org) {
		var target = this.buildTarget(peer, org);
		var client = this.getClientForOrg(org);
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
	}

	buildTarget(peer, org) {

		return this.peers[[org, peer]];
	}

}

module.exports = new FabricClientProxy();
