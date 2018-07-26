/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var path = require('path');
var fs = require('fs-extra');
var FabricClient = require('./FabricClient.js');
var FabricServices = require('./service/FabricServices.js');
var RestServices = require('./service/RestServices.js');
var dbroutes = require('./rest/dbroutes.js');
var platformroutes = require('./rest/platformroutes.js');
var helper = require('../../helper.js');
var logger = helper.getLogger('Platform');

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
    logger.debug(
      '******* Initialization started for hyperledger fabric platform ******'
    );
    await this.buildClientsFromFile(config_path);
    if (this.clients.size == 0) {
      logger.error(
        '************* There is no client found for Hyperledger fabric platform *************'
      );
      throw 'There is no client found for Hyperledger fabric platform';
    }
    // updating the client network and other details to DB
    await this.fabricServices.synchNetworkConfigToDB();
    // initializing the rest app services
    await dbroutes(this.app, this.restServices);
    await platformroutes(this.app, this.restServices);
    // setting interval for validating any missing block from the current client ledger
    // set synchBlocksTime property in platform config.json in minutes
    setInterval(function() {
      _self.isChannelEventHubConnected();
    }, this.synchBlocksTime);
    logger.debug(
      '******* Initialization end for hyperledger fabric platform ******'
    );
  }
  async buildClientsFromFile(config_path) {
    let _self = this;
    // loading the config.json
    let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let client_configs = all_config[NETWORK_CONFIGS];
    // setting the block synch interval time
    await this.setSynchBlocksTime(client_configs);
    logger.debug('Blocks synch interval time >> %s', this.synchBlocksTime);
    // update the discovery-cache-life as block synch interval time in global config
    global.hfc.config.set('discovery-cache-life', this.synchBlocksTime);
    // clone global.hfc.config configuration
    var global_hfc_config = JSON.parse(JSON.stringify(global.hfc.config));
    // setting organization enrolment files
    logger.debug('Setting admin organization enrolment files');
    this.client_configs = await this.setAdminOrganizationEnrolmentFiles(
      client_configs
    );
    // Create fabric explorer client for each
    // Each client is connected to only a single peer and monitor that particular peer only
    for (let client_name in this.client_configs) {
      // set default client as first client
      if (!this.defaultClient) {
        this.defaultClient = client_name;
      }
      let c_config = this.client_configs[client_name];
      let client_config = global_hfc_config;
      // validate client configuration
      logger.debug('Validating client [%s] configuration', client_name);
      let validation = this.validateClientConfig(c_config);

      if (validation) {
        client_config.client = c_config.client;
        client_config.version = c_config.version;
        client_config.channels = c_config.channels;
        client_config.organizations = c_config.organizations;
        client_config.peers = c_config.peers;
        client_config.orderers = c_config.orderers;
        // create client object from json
        let client = await this.buildClientFromJSON(client_name, client_config);
        // getting all channels for the client
        let channels = await client.getChannels();
        // set client into clients map
        this.clients.set(client_name, client);
        // set default channel client
        this.channelsClient.set(client_config.client.channel, client);
        // seeting other channel client
        for (var [channel_name, value] of channels.entries()) {
          // it will not set channel client if it is already defined
          if (!this.channelsClient.get(channel_name)) {
            this.channelsClient.set(channel_name, client);
          }
        }
      }
    }
  }

  async buildClientFromJSON(client_name, client_config) {
    // create new FabricClient
    let client = new FabricClient(client_name, this.fabricServices);
    // initialize fabric client
    logger.debug(
      '************ Initializing fabric client for [%s]************',
      client_name
    );
    await client.initialize(client_config);
    return client;
  }

  async isChannelEventHubConnected() {
    for (var [client_name, client] of this.clients.entries()) {
      for (var [channel_name, channel] of client.getChannels().entries()) {
        // validate channel event is connected
        let status = client.isChannelEventHubConnected(channel_name);
        if (status) {
          this.fabricServices.synchBlocks(client_name, channel_name);
        } else {
          // channel client is not connected then it will reconnect
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
  async setAdminOrganizationEnrolmentFiles(client_configs) {
    for (let client_name in client_configs) {
      let client_config = client_configs[client_name];
      if (client_config && client_config.organizations) {
        for (let organization_name in client_config.organizations) {
          // checking files path is defined as full path or directory
          // if directory, then it will consider the first file
          let organization = client_config.organizations[organization_name];
          if (!organization.fullpath) {
            // setting admin private key as first file from keystore dir
            logger.debug(
              'Organization [%s] enrolment files path defined as directory',
              organization_name
            );
            if (organization.adminPrivateKey) {
              let privateKeyPath = organization.adminPrivateKey.path;
              var files = fs.readdirSync(privateKeyPath);
              if (files && files.length > 0) {
                organization.adminPrivateKey.path = path.join(
                  privateKeyPath,
                  files[0]
                );
              }
            }
            // setting admin private key as first file from signcerts dir
            if (organization.signedCert) {
              let signedCertPath = organization.signedCert.path;
              var files = fs.readdirSync(signedCertPath);
              if (files && files.length > 0) {
                organization.signedCert.path = path.join(
                  signedCertPath,
                  files[0]
                );
              }
            }
          } else {
            logger.debug(
              'Organization [%s] enrolment files path defined as full path',
              organization_name
            );
          }
        }
      }
    }
    return client_configs;
  }

  validateClientConfig(client_config) {
    logger.debug('Client configuration >> %j ', client_config);
    let message = !client_config.version
      ? 'Client network version is not defined in configuration'
      : '';
    if (message) {
      logger.error(message);
      return false;
    }
    message = !client_config.client
      ? 'Client is not defined in configuration'
      : !client_config.client.organization
        ? 'Client organization is not defined in configuration'
        : !client_config.client.channel
          ? 'Client default channel is not defined in configuration '
          : !(
              client_config.client.credentialStore &&
              client_config.client.credentialStore.path
            )
            ? 'Client credential store path is not defined in configuration '
            : !(
                client_config.client.credentialStore.cryptoStore &&
                client_config.client.credentialStore.cryptoStore.path
              )
              ? 'Client crypto store path is not defined in configuration '
              : null;

    if (message) {
      logger.error(message);
      return false;
    }

    message = !client_config.channels
      ? 'Channels is not defined in configuration'
      : !client_config.channels[client_config.client.channel]
        ? 'Default channel [' +
          client_config.client.channel +
          '] is not defined in configuration'
        : null;

    if (message) {
      logger.error(message);
      return false;
    }

    for (let channel_name in client_config.channels) {
      message = !(
        client_config.channels[channel_name].peers &&
        Object.keys(client_config.channels[channel_name].peers).length > 0
      )
        ? 'Default peer is not defined for channel [' +
          channel_name +
          '] in configuration'
        : !client_config.peers
          ? 'Peers is not defined in configuration'
          : !client_config.peers[
              Object.keys(client_config.channels[channel_name].peers)[0]
            ]
            ? 'Default channel peers [' +
              Object.keys(client_config.channels[channel_name].peers)[0] +
              '] is not defined in configuration'
            : !(
                client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].tlsCACerts &&
                client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].tlsCACerts.path
              )
              ? 'TLS CA Certs path is not defined default peer [' +
                Object.keys(client_config.channels[channel_name].peers)[0] +
                '] in configuration'
              : !client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].url
                ? 'URL is not defined default peer [' +
                  Object.keys(client_config.channels[channel_name].peers)[0] +
                  '] in configuration'
                : !client_config.peers[
                    Object.keys(client_config.channels[channel_name].peers)[0]
                  ].eventUrl
                  ? 'Event URL is not defined default peer [' +
                    Object.keys(client_config.channels[channel_name].peers)[0] +
                    '] in configuration'
                  : !(
                      client_config.peers[
                        Object.keys(
                          client_config.channels[channel_name].peers
                        )[0]
                      ].grpcOptions &&
                      client_config.peers[
                        Object.keys(
                          client_config.channels[channel_name].peers
                        )[0]
                      ].grpcOptions['ssl-target-name-override']
                    )
                    ? 'Server hostname is not defined default peer [' +
                      Object.keys(
                        client_config.channels[channel_name].peers
                      )[0] +
                      '] in configuration'
                    : null;

      if (message) {
        logger.error(message);
        return false;
      }
    }

    message = !client_config.organizations
      ? 'Organizations is not defined in configuration'
      : !client_config.organizations[client_config.client.organization]
        ? 'Client organization [' +
          client_config.client.organization +
          '] is not defined in configuration'
        : !(
            client_config.organizations[client_config.client.organization]
              .signedCert &&
            client_config.organizations[client_config.client.organization]
              .signedCert.path
          )
          ? 'Client organization signed Cert path for [' +
            client_config.client.organization +
            '] is not defined in configuration'
          : null;

    if (message) {
      logger.error(message);
      return false;
    }

    for (let org_name in client_config.organizations) {
      message = !client_config.organizations[org_name].mspid
        ? 'Organization mspid for [' +
          org_name +
          '] is not defined in configuration'
        : !(
            client_config.organizations[org_name].adminPrivateKey &&
            client_config.organizations[org_name].adminPrivateKey.path
          )
          ? 'Organization admin private key path for [' +
            org_name +
            '] is not defined in configuration'
          : null;

      if (message) {
        logger.error(message);
        return false;
      }
      message = !client_config.peers
        ? 'Peers is not defined in configuration'
        : !(
            client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].tlsCACerts &&
            client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].tlsCACerts.path
          )
          ? 'TLS CA Certs path is not defined default peer [' +
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0] +
            '] in configuration'
          : !client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].url
            ? 'URL is not defined default peer [' +
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0] +
              '] in configuration'
            : !client_config.peers[
                Object.keys(
                  client_config.channels[client_config.client.channel].peers
                )[0]
              ].eventUrl
              ? 'Event URL is not defined default peer [' +
                Object.keys(
                  client_config.channels[client_config.client.channel].peers
                )[0] +
                '] in configuration'
              : !(
                  client_config.peers[
                    Object.keys(
                      client_config.channels[client_config.client.channel].peers
                    )[0]
                  ].grpcOptions &&
                  client_config.peers[
                    Object.keys(
                      client_config.channels[client_config.client.channel].peers
                    )[0]
                  ].grpcOptions['ssl-target-name-override']
                )
                ? 'Server hostname is not defined default peer [' +
                  Object.keys(
                    client_config.channels[client_config.client.channel].peers
                  )[0] +
                  '] in configuration'
                : null;
    }

    for (let peer_name in client_config.peers) {
      message = !client_config.peers[peer_name].url
        ? 'Peer URL for [' + peer_name + '] is not defined in configuration'
        : null;
      if (message) {
        logger.error(message);
        return false;
      }
    }

    message = !client_config.orderers
      ? 'Orderers is not defined in configuration'
      : !Object.keys(client_config.orderers).length
        ? 'Default orderer is not defined in configuration'
        : !client_config.orderers[Object.keys(client_config.orderers)[0]].url
          ? 'Default orderer URL is not defined in configuration'
          : null;

    if (message) {
      logger.error(message);
      return false;
    }

    for (let ord_name in client_config.orderers) {
      message = !client_config.orderers[ord_name].url
        ? 'Orderer URL for [' + ord_name + '] is not defined in configuration'
        : null;
      if (message) {
        logger.error(message);
        return false;
      }
    }
    return true;
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
