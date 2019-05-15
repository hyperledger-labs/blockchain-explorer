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

const CRUDService = require('../../persistence/fabric/CRUDService');
const MetricService = require('../../persistence/fabric/MetricService');

const { createChannel, getChannel } = require('./service/cliWrapperService');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;

const config_path = path.resolve(__dirname, './config.json');
const explorerconfig = require('../../explorerconfig.json');

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
    const _self = this;

    // loading the config.json
    const all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    const network_configs = all_config[fabric_const.NETWORK_CONFIGS];
    this.syncType = all_config.syncType;

    const channels = Object.values(network_configs).reduce((acc, val) => {
      return acc.concat(Object.keys(val.channels));
    }, []);

    for (let channel of channels) {
      const rn = channel.replace('channel', '');
      try {
        const peerOrgs = Object.keys(
          Object.values(network_configs)[0].clients
        )[0];
        const orderer = Object.values(
          Object.values(network_configs)[0].orderers
        )[0].organization;
        console.log('test channel ', rn, peerOrgs, orderer);
        const resp = await getChannel({
          peerOrgs,
          orderer,
          randomNumber: rn
        });
        console.log('test channel get', resp.data);
        if (resp.data && !resp.data.success) {
          console.log('creating channel', rn);
          await createChannel({
            orderer,
            peerOrgs,
            randomNumber: rn,
            autojoin: true
          });
        }
      } catch (err) {
        logger.debug('create channel fail');
      }
    }

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

  async reinitialize(newOrgConfig, name) {
    const config = FabricUtils.setOrgEnrolmentPath(
      JSON.parse(JSON.stringify(newOrgConfig))
    );
    const client = await FabricUtils.createFabricClient(
      config,
      name,
      this.persistence
    );

    const clients = this.networks.get(this.defaultNetwork);
    clients.set(name, client);

    this.defaultClient = name;
    let explorerListener = this.explorerListeners.find(
      listener => listener.client_name === name
    );
    if (!explorerListener) {
      explorerListener = new ExplorerListener(this, explorerconfig.sync);
      explorerListener.initialize([
        this.defaultNetwork,
        name,
        '1',
        JSON.stringify({
          'network-configs': {
            [this.defaultNetwork]: newOrgConfig
          }
        })
      ]);
      this.explorerListeners.push({
        client_name: name,
        explorerListener
      });
    }
  }

  async buildClients(network_configs) {
    const _self = this;
    let clientstatus = true;

    // setting organization enrolment files
    logger.debug('Setting admin organization enrolment files');
    try {
      this.network_configs = await FabricUtils.setAdminEnrolmentPath(
        network_configs
      );
    } catch (e) {
      logger.error(e);
      clientstatus = false;
      this.network_configs = network_configs;
    }

    for (const network_name in this.network_configs) {
      this.networks.set(network_name, new Map());
      const client_configs = this.network_configs[network_name];
      if (!this.defaultNetwork) {
        this.defaultNetwork = network_name;
      }

      // Create fabric explorer client for each
      // Each client is connected to only a single peer and monitor that particular peer only
      for (const client_name in client_configs.clients) {
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
        } else {
          client = await FabricUtils.createDetachClient(
            client_configs,
            client_name,
            this.persistence
          );
        }
        if (client) {
          // set client into clients map
          const clients = this.networks.get(network_name);
          clients.set(client_name, client);
        }
      }
    }
  }

  initializeListener(syncconfig) {
    for (const [network_name, clients] of this.networks.entries()) {
      for (const [client_name, client] of clients.entries()) {
        if (this.getClient(network_name, client_name).getStatus()) {
          const explorerListener = new ExplorerListener(this, syncconfig);
          explorerListener.initialize([network_name, client_name, '1']);
          explorerListener.send('Successfully send a message to child process');
          this.explorerListeners.push({
            client_name,
            explorerListener
          });
        }
      }
    }
  }

  setPersistenceService() {
    // setting platfrom specific CRUDService and MetricService
    this.persistence.setMetricService(
      new MetricService(this.persistence.getPGService())
    );
    this.persistence.setCrudService(
      new CRUDService(this.persistence.getPGService())
    );
  }

  changeNetwork(network_name, client_name, channel_name) {
    const network = this.networks.get(network_name);
    if (network) {
      this.defaultNetwork = network_name;
      let client;
      if (client_name) {
        client = network.get(client_name);
        if (client) {
          this.defaultClient = client_name;
        } else {
          return `Client [${network_name}] is not found in network`;
        }
      } else {
        const iterator = network.values();
        client = iterator.next().value;
        if (!client) {
          return `Client [${network_name}] is not found in network`;
        }
      }
      if (channel_name) {
        client.setDefaultChannel(channel_name);
      }
    } else {
      return `Network [${network_name}] is not found`;
    }
  }

  getNetworks() {
    return this.networks;
  }

  getClient(network_name, client_name) {
    return this.networks
      .get(network_name || this.defaultNetwork)
      .get(client_name || this.defaultClient);
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
    for (const explorerListener of this.explorerListeners) {
      explorerListener.explorerListener.close();
    }
  }
}

module.exports = Platform;
