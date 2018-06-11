/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var path = require("path");
var helper = require("../../helper.js");
var logger = helper.getLogger("platform");
var configuration = require("./Configuration.js");
var fs = require("fs-extra");
var FabricChannel = require("./FabricChannel.js");
var Proxy = require("./Proxy.js");
var hfc = require("fabric-client");
hfc.addConfigFile(path.join(__dirname, "./config.json"));
var helper = require('../../helper.js');
var logger = helper.getLogger('networkservice');
var path = require('path');


class Platform {
  constructor() {
    this.clients = {};
    this.channels = {};
    this.caClients = {};
    this.peers = {};
  }

  getDefaultProxy() {
    return this.getProxy(
      configuration.getDefaultOrg(),
      configuration.getDefaultPeer()
    );
  }

  getProxy(org, peer) {
    return new Proxy(
      this.getPeerObject(org, peer),
      this.getClientForOrg(org),
      this.channels
    );
  }

  getDefaultPeer() {
    return this.getPeerObject(
      configuration.getDefaultOrg(),
      configuration.getDefaultPeer()
    );
  }

  getChannels() {
    return Object.keys(this.channels);
  }

  getPeerObject(org, peer) {
    return this.peers[[org, peer]];
  }

  getDefaultClient() {
    return this.getClientForOrg(configuration.getDefaultOrg());
  }

  getClientForOrg(org) {
    return this.clients[org];
  }

  async setAdminForClient(org, client) {
    var admin = configuration.getOrg(org).admin;
    var keyPath = admin.key;
    var keyPEM = Buffer.from(helper.readAllFiles(keyPath)[0]).toString();
    var certPath = admin.cert;
    var certPEM = helper.readAllFiles(certPath)[0].toString();
    var admin;

    try {
      admin = await client.createUser({
        username: "peer" + org + "Admin",
        mspid: configuration.getMspID(org),
        cryptoContent: {
          privateKeyPEM: keyPEM,
          signedCertPEM: certPEM
        },
        skipPersistence: false
      });

      client.setAdminSigningIdentity(
        keyPEM,
        certPEM,
        configuration.getMspID(org)
      );
    } catch (err) {
      console.log("error-admin--" + err.stack);
      throw err;
    }

    return admin;
  }

  // set up the client and channel objects for each org
  async initialize() {
    for (let key of configuration.getOrgs()) {
      let client = new hfc();
      let cryptoSuite = hfc.newCryptoSuite();

      var store = await hfc.newDefaultKeyValueStore({
        path: configuration.getKeyStoreForOrg(configuration.getOrgName(key))
      });

      client.setStateStore(store);

      await cryptoSuite.setCryptoKeyStore(
        hfc.newCryptoKeyStore({
          path: configuration.getKeyStoreForOrg(configuration.getOrg(key).name)
        })
      );
      client.setCryptoSuite(cryptoSuite);

      this.clients[key] = client;
      //For each client setup a admin user as signining identity
      await this.setAdminForClient(key, client);

      this.setupPeers(key, client, false);
    }

    await this.setChannels();
  }

  setupPeers(org, client, isReturn) {
    configuration.getPeersByOrg(org).forEach(key => {
      let peer;
      if (configuration.getOrg(org)[key]["tls_cacerts"] != undefined) {
        let data = fs.readFileSync(
          configuration.getOrg(org)[key]["tls_cacerts"]
        );
        peer = client.newPeer(configuration.getOrg(org)[key].requests, {
          pem: Buffer.from(data).toString(),
          "ssl-target-name-override": configuration.getOrg(org)[key][
            "server-hostname"
          ]
        });
      } else {
        peer = client.newPeer(configuration.getOrg(org)[key].requests);
      }

      this.peers[[org, key]] = peer;
    });
  }

  async setChannels() {
    var client = this.getClientForOrg(configuration.getDefaultOrg());

    var proxy = this.getDefaultProxy();
    var channelInfo = await proxy.queryChannels();

    channelInfo.channels.forEach(chan => {
      var channelName = chan.channel_id;
      let channel = client.newChannel(channelName);
      channel.addPeer(this.getDefaultPeer());
      var channel_event_hub = channel.newChannelEventHub(this.getDefaultPeer());
      this.channels[channelName] = new FabricChannel(
        channelName,
        channel,
        channel_event_hub
      );
    });
  }


  async  getClientFromPath(userorg, orgPath, networkCfgPath) {
    try {
      let config = '-connection-profile-path';
      let networkConfig = 'network' + config;
      hfc.setConfigSetting(networkConfig, networkCfgPath);
      hfc.setConfigSetting(userorg + config, orgPath);
      let client = hfc.loadFromConfig(hfc.getConfigSetting(networkConfig));
      client.loadFromConfig(hfc.getConfigSetting(userorg + config));
      await client.initCredentialStores();
      return client;
    }catch(err) {
      logger.error("getClientForOrg", err);
      return null;
    }
  }

  async createChannel(artifacts) {
      logger.info("############### C R E A T E  C H A N N E L ###############");
      logger.info("Creating channel: " + artifacts.orgName, artifacts.orgConfigPath, artifacts.channelConfigPath);
      try {
        var client = await this.getClientFromPath(artifacts.orgName, artifacts.orgConfigPath,
          artifacts.channelConfigPath);
        var envelope = fs.readFileSync(artifacts.channelTxPath);
        var channelConfig = client.extractChannelConfig(envelope);
        let signature = client.signChannelConfig(channelConfig);

        let request = {
          config: channelConfig,
          signatures: [signature],
          name: artifacts.channelName,
          txId: client.newTransactionID(true)
        };

        var response = await client.createChannel(request);

        return response;

      } catch (error) {
        logger.error("createChannel", error)
        return null;
      }
  }
}

module.exports = Platform;
