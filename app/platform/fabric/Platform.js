/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const fs = require('fs-extra');

const Proxy = require('./Proxy');
const helper = require('../../common/helper');
const ExplorerError = require('../../common/ExplorerError');
const logger = helper.getLogger('Platform');
const FabricUtils = require('./utils/FabricUtils.js');
const ExplorerListener = require('../../sync/listener/ExplorerListener');

let CRUDService = require('../../persistence/fabric/CRUDService');
let MetricService = require('../../persistence/fabric/MetricService');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;
const config_path = path.resolve(__dirname, './config.json');

class Platform {
  constructor(persistence, broadcaster) {
    this.persistence = persistence;
    this.broadcaster = broadcaster;
    this.networks = new Map();
    this.proxy = new Proxy(this);
    this.defaultNetwork;
    this.defaultClient;
    this.network_configs;
    this.syncType;
    this.explorerListeners = [];
  }

  async initialize() {
    let _self = this;

    // loading the config.json
    let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let network_configs = all_config[fabric_const.NETWORK_CONFIGS];
    this.syncType = all_config.syncType;

    // build client context
    logger.debug(
      '******* Initialization started for hyperledger fabric platform ******'
    );

    await this.buildClients(network_configs);

    if (
      this.networks.size == 0 &&
      this.networks.get(this.defaultNetwork).size == 0
    ) {
      logger.error(
        '************* There is no client found for Hyperledger fabric platform *************'
      );
      throw new ExplorerError(explorer_error.ERROR_2008);
    }
  }

  async buildClients(network_configs) {
    let _self = this;
    let clientstatus = true;

    // setting organization enrolment files
    logger.debug('Setting admin organization enrolment files');
    try {
      this.network_configs = await FabricUtils.setAdminEnrolmentPath(network_configs);
    } catch (e) {
      logger.error(e);
      clientstatus = false;
      this.network_configs = network_configs;
    }

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
        let client;

        if (clientstatus) {
          client = await FabricUtils.createFabricClient(
            client_configs,
            client_name,
            this.persistence
          );
        }
        else {
          client = await FabricUtils.createDetachClient(
            client_configs,
            client_name,
            this.persistence);
        }
        if (client) {
          // set client into clients map
          let clients = this.networks.get(network_name);
          clients.set(client_name, client);
        }
      }
    }
  }

  initializeListener(syncconfig) {
    for (var [network_name, clients] of this.networks.entries()) {
      for (var [client_name, client] of clients.entries()) {
        if (this.getClient(network_name, client_name).getStatus()) {
          let explorerListener = new ExplorerListener(this, syncconfig);
          explorerListener.initialize([network_name, client_name, '1']);
          explorerListener.send('Successfully send a message to child process');
          this.explorerListeners.push(explorerListener);
        }
      }
    }
  }

  setPersistenceService() {
    // setting platfrom specific CRUDService and MetricService
    this.persistence.setMetricService(new MetricService(this.persistence.getPGService()));
    this.persistence.setCrudService(new CRUDService(this.persistence.getPGService()));
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
          return 'Client [' + network_name + '] is not found in network';
        }
      } else {
        var iterator = network.values();
        client = iterator.next().value;
        if (!client) {
          return 'Client [' + network_name + '] is not found in network';
        }
      }
      if (channel_name) {
        client.setDefaultChannel(channel_name);
      }
    } else {
      return 'Network [' + network_name + '] is not found';
    }
  }

  getNetworks() {
    return this.networks;
  }

  getClient(network_name, client_name) {

    return this.networks
      .get(network_name ? network_name : this.defaultNetwork)
      .get(client_name ? client_name : this.defaultClient);
  }

  getPersistence() {
    return this.persistence;
  }
  getBroadcaster() {
    return this.broadcaster;
  }

  getProxy() {
    return this.proxy;
  }

  setDefaultClient(defaultClient) {
    this.defaultClient = defaultClient;
  }

  async destroy() {
    console.log(
      '<<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>'
    );
    for (let explorerListener of this.explorerListeners) {
      explorerListener.close();
    }
  }
}
module.exports = Platform;
