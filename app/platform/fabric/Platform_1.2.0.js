/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var path = require("path");
var fs = require('fs-extra');
var FabricClient = require('./FabricClient.js');
var FabricServices = require('./service/FabricServices.js');
var RestServices = require('./service/RestServices.js');
var dbroutes = require("./rest/dbroutes.js");
var platformroutes = require("./rest/platformroutes.js");
var helper = require("../../helper.js");
var logger = helper.getLogger("Platform");

var config_path = path.resolve(__dirname, './config_1.2.0.json');

const NETWORK_CONFIGS = 'network-configs';

class Platform {
  constructor(app, persistence, broadcaster) {
    this.app = app;
    this.persistence = persistence;
    this.broadcaster = broadcaster;
    this.clients = new Map();
    this.channelsClient = new Map();
    this.fabricServices = new FabricServices(this, persistence, broadcaster);
    this.restServices = new RestServices(this, persistence, broadcaster);
    this.synchBlocksTime = 60000;
    this.defaultClient;
    this.client_configs;
  }

  async initialize() {
    let _self = this;

    // build client context
    await this.buildClientsFromFile(config_path);

    // update client configuration details to DB
    await this.fabricServices.synchNetworkConfigToDB();

    await dbroutes(this.app, this.restServices);
    await platformroutes(this.app, this.restServices);

    setInterval(function () {
      _self.isChannelEventHubConnected();
    }, this.synchBlocksTime);

  }

  async buildClientsFromFile(config_path) {

    let _self = this;

    let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let client_configs = all_config[NETWORK_CONFIGS];
    await this.setSynchBlocksTime(client_configs);
    global.hfc.config.set('discovery-cache-life', this.synchBlocksTime);
    var global_hfc_config = JSON.parse(JSON.stringify(global.hfc.config));// clone global.hfc.config configuration

    this.client_configs = await this.setAdminPrivateKey(client_configs);

    for (let client_name in this.client_configs) {

      if (!this.defaultClient) {
        this.defaultClient = client_name;
      }

      let c_config = this.client_configs[client_name];

      let client_config = global_hfc_config;

      if (c_config.client) {
        client_config.client = c_config.client;
        client_config.version = c_config.version;
        client_config.channels = c_config.channels;
        client_config.organizations = c_config.organizations;
        client_config.peers = c_config.peers;
        client_config.orderers = c_config.orderers;

        let client = await this.buildClientFromJSON(client_name, client_config);

        let channels = await client.getChannels();
        this.clients.set(client_name, client);
        this.channelsClient.set(client_config.client.channel, client);

        for (var [channel_name, value] of channels.entries()) {
          if (!this.channelsClient.get(channel_name)) {
            this.channelsClient.set(channel_name, client);
          }
        }
      }
    }
  }

  async buildClientFromJSON(client_name, client_config) {

    let client = new FabricClient(client_name, this.fabricServices);
    await client.initialize(client_config);
    return client;
  }

  async isChannelEventHubConnected() {
    for (var [client_name, client] of this.clients.entries()) {
      for (var [channel_name, channel] of client.getChannels().entries()) {
        let status = client.isChannelEventHubConnected(channel_name);
        if (status) {
          this.fabricServices.synchBlocks(client_name, channel_name);
        } else {
          client.connectChannelEventHub(channel_name);
        }
      }
    }
  }

  async setSynchBlocksTime(client_configs) {

    if (client_configs.synchBlocksTime) {
      let time = parseInt(client_configs.synchBlocksTime, 10);
      if (!isNaN(time)) {
        //this.synchBlocksTime = 1 * 10 * 1000;
        this.synchBlocksTime = time * 60 * 1000;
      }
    }

  }
  async setAdminPrivateKey(client_configs) {


    for (let client_name in client_configs) {

      let client_config = client_configs[client_name];

      if (client_config && client_config.organizations) {
        for (let organization_name in client_config.organizations) {
          let fPath = client_config.organizations[organization_name].adminPrivateKey.path;
          var files = fs.readdirSync(fPath);
          if (files && files.length > 0) {
            client_config.organizations[organization_name].adminPrivateKey.path = path.join(fPath, files[0]);
          }
        }
      }
    }
    return client_configs;
  }

  getApp() {
    return this.app;
  }

  getClients() {
    return this.clients;
  }

  getClient(clientName) {
    return this.clients.get(clientName);
  }

  getChannelClient(channelName) {
    return this.channelsClient.get(channelName);
  }
  getPersistence() {
    return this.persistence;
  }
  getBroadcaster() {
    return this.broadcaster;
  }

  getFabricServices() {
    return this.fabricServices;
  }

  getRestServices() {
    return this.restServices;
  }

  getDefaultClient() {
    return this.clients.get(this.defaultClient);
  }

  setDefaultClient(defaultClient) {
    this.defaultClient = defaultClient;
  }

  async distroy() {
    for (var [client_key, client] of this.clients.entries()) {
      if (client) {
        client.disconnectEventHubs();
      }
    }
  }
}
module.exports = Platform;