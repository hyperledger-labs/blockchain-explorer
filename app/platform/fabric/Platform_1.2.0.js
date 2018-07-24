/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const path = require("path");
const fs = require('fs-extra');
const { fork } = require('child_process');
const RestServices = require('./service/RestServices.js');
const dbroutes = require("./rest/dbroutes.js");
const platformroutes = require("./rest/platformroutes.js");
const helper = require("../../helper.js");
const logger = helper.getLogger("Platform");
const FabricUtils = require('./FabricUtils.js');

const explorer_const = require('./FabricUtils.js').explorer.const;

const config_path = path.resolve(__dirname, './config_1.2.0.json');

class Platform {
  constructor(app, persistence, broadcaster) {
    this.app = app;
    this.persistence = persistence;
    this.broadcaster = broadcaster;
    this.networks = new Map();
    this.clientProcess = [];
    this.restServices = new RestServices(this, persistence);
    this.defaultNetwork;
    this.defaultClient;
    this.network_configs;
  }

  async initialize() {
    let _self = this;

    // build client context
    logger.debug('******* Initialization started for hyperledger fabric platform ******');
    await this.buildClientsFromFile(config_path);

    if (this.networks.size == 0 && this.networks.get(this.defaultNetwork).size == 0) {
      logger.error('************* There is no client found for Hyperledger fabric platform *************');
      throw ("There is no client found for Hyperledger fabric platform");
    }
    // initializing the rest app services
    await dbroutes(this.app, this.restServices);
    await platformroutes(this.app, this.restServices);

  }

  async buildClientsFromFile(config_path) {

    let _self = this;
    // loading the config.json
    let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let network_configs = all_config[explorer_const.NETWORK_CONFIGS];

    // setting organization enrolment files
    logger.debug('Setting admin organization enrolment files');
    this.network_configs = await FabricUtils.setAdminEnrolmentPath(network_configs);

    for (let network_name in this.network_configs) {

      this.networks.set(network_name, new Map());

      let client_configs = this.network_configs[network_name];
      if (!this.defaultNetwork) {
        this.defaultNetwork = network_name;
      }

      // Create fabric explorer client for each
      // Each client is connected to only a single peer and monitor that particular peer only
      for (let client_name in client_configs.clients) {
        // set default client as first client
        if (!this.defaultClient) {
          this.defaultClient = client_name;
        }
        // create client instance
        logger.debug('Creatinging client [%s] >> ', client_name);
        let client = await FabricUtils.createFabricClient(client_configs, client_name);
        if (client) {
          // set client into clients map
          let clients = this.networks.get(network_name);
          clients.set(client_name, client);
          this.startClientProcessor(network_name, client_name);
        }
      }
    }
  }

  startClientProcessor(network_name, client_name) {

    const clientProcessor = fork(path.resolve(__dirname, './ClientProcessor.js'), [network_name, client_name]);

    this.clientProcess.push(clientProcessor);

    clientProcessor.on('message', (msg) => {
      // get message from child process
      logger.debug('Message from child %j', msg);
      if (explorer_const.NOTITY_TYPE_NEWCHANNEL === msg.notify_type) {
        // initialize new channel instance in parent
        if (msg.network_name && msg.client_name) {
          let client = this.networks.get(msg.network_name).get(msg.client_name);
          if (msg.channel_name) {
            client.initializeNewChannel(msg.channel_name);
          }
          else {
            logger.error('Channel name should pass to proces the notification from child process');
          }
        } else {
          logger.error('Network name and client name should pass to proces the notification from child process');
        }
      } else if (explorer_const.NOTITY_TYPE_UPDATECHANNEL === msg.notify_type ||
        explorer_const.NOTITY_TYPE_CHAINCODE === msg.notify_type) {
        // update channel details in parent
        if (msg.network_name && msg.client_name) {
          let client = this.networks.get(msg.network_name).get(msg.client_name);
          if (msg.channel_name) {
            client.initializeChannelFromDiscover(msg.channel_name);
          }
          else {
            logger.error('Channel name should pass to proces the notification from child process');
          }
        } else {
          logger.error('Network name and client name should pass to proces the notification from child process');
        }
      } else if (explorer_const.NOTITY_TYPE_BLOCK === msg.notify_type) {
        // broad cast new block message to client
        var notify = {
          'title': msg.title,
          'type': msg.type,
          'message': msg.message,
          'time': msg.time,
          'txcount': msg.txcount,
          'datahash': msg.datahash
        };
        this.getBroadcaster().broadcast(notify);
      } else {
        logger.error('Child process notify is not implemented for this type %s ', msg.notify_type);
      }
    });
    clientProcessor.send({ message: 'Successfully send a message to child process' });

  }

  changeNetwork(network_name, client_name, channel_name) {

    let network = this.networks.get(network_name);
    if (network) {
      this.defaultNetwork = network_name;
      let client;
      if (client_name) {
        client = network.get(client_name);
        if (client) {
          this.defaultClient = client_name;
        } else {
          return "Client [" + network_name + "] is not found in network";
        }
      } else {
        var iterator = network.values();
        client = iterator.next().value;
        if (!client) {
          return "Client [" + network_name + "] is not found in network";
        }
      }
      if (channel_name) {
        client.setDefaultChannel(channel_name);
      }
    } else {
      return "Network [" + network_name + "] is not found";
    }

  }

  getApp() {
    return this.app;
  }

  getNetworks() {
    return this.networks;
  }

  getClient(network_name, client_name) {
    return this.networks.get((network_name ? network_name : this.defaultNetwork))
      .get(client_name ? client_name : this.defaultClient);
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

  setDefaultClient(defaultClient) {
    this.defaultClient = defaultClient;
  }

  async distroy() {
    for (var [network_name, clients] of this.networks.entries()) {
      for (var [client_name, client] of clients.entries()) {
        if (client) {
          client.disconnectEventHubs();
        }
      }
      for (let clientPro of this.clientProcess) {
        clientPro.exit();
      }
    }
  }
}
module.exports = Platform;