/*
    SPDX-License-Identifier: Apache-2.0
*/
'use strict';

const path = require('path');
const fs = require('fs-extra');

const SyncService = require('../sync/SyncService');
const FabricUtils = require('../utils/FabricUtils');
const FabricEvent = require('./FabricEvent');

const helper = require('../../../common/helper');
const logger = helper.getLogger('SyncPlatform');
const ExplorerError = require('../../../common/ExplorerError');

let CRUDService = require('../../../persistence/fabric/CRUDService');
let MetricService = require('../../../persistence/fabric/MetricService');

const fabric_const = require('../utils/FabricConst').fabric.const;
const explorer_mess = require('../../../common/ExplorerMessage').explorer;
const config_path = path.resolve(__dirname, '../config.json');

class SyncPlatform {
  constructor(persistence, sender) {
    this.network_name;
    this.client_name;
    this.client;
    this.eventHub;
    this.sender = sender;
    this.persistence = persistence;
    this.syncService = new SyncService(this, this.persistence);
    this.blocksSyncTime = 60000;
    this.client_configs;
  }

  async initialize(args) {
    let _self = this;

    logger.debug(
      '******* Initialization started for child client process %s ******',
      this.client_name
    );

    // loading the config.json
    let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let network_configs = all_config[fabric_const.NETWORK_CONFIGS];

    if (args.length == 0) {
      // get the first network and first client
      this.network_name = Object.keys(network_configs)[0];
      this.client_name = Object.keys(
        network_configs[Object.keys(network_configs)[0]].clients
      )[0];
    } else if (args.length == 1) {
      // get the first client with respect to the passed network name
      this.network_name = args[0];
      this.client_name = Object.keys(
        network_configs[this.network_name].clients
      )[0];
    } else {
      this.network_name = args[0];
      this.client_name = args[1];
    }

    console.log(
      '\n' + explorer_mess.message.MESSAGE_1002,
      this.network_name,
      this.client_name
    );

    // setting the block synch interval time
    await this.setBlocksSyncTime(all_config);

    logger.debug('Blocks synch interval time >> %s', this.blocksSyncTime);
    // update the discovery-cache-life as block synch interval time in global config
    global.hfc.config.set('discovery-cache-life', this.blocksSyncTime);

    let client_configs = network_configs[this.network_name];

    this.client_configs = await FabricUtils.setOrgEnrolmentPath(client_configs);

    this.client = await FabricUtils.createFabricClient(
      this.client_configs,
      this.client_name
    );
    if (!this.client) {
      throw new ExplorerError(explorer_mess.error.ERROR_2011);
    }
    let peer = {
      requests: this.client.getDefaultPeer().getUrl(),
      mspid: this.client_configs.organizations[
        this.client_configs.clients[this.client_name].organization
      ].mspid
    };

    let peerStatus = await this.client.getPeerStatus(peer);

    if (peerStatus.status) {
      // updating the client network and other details to DB
      let res = await this.syncService.synchNetworkConfigToDB(this.client);
      if (!res) {
        return;
      }

      //start event
      this.eventHub = new FabricEvent(this.client, this.syncService);
      await this.eventHub.initialize();

      // setting interval for validating any missing block from the current client ledger
      // set blocksSyncTime property in platform config.json in minutes
      setInterval(function() {
        _self.isChannelEventHubConnected();
      }, this.blocksSyncTime);
      logger.debug(
        '******* Initialization end for child client process %s ******',
        this.client_name
      );
    } else {
      throw new ExplorerError(explorer_mess.error.ERROR_1009);
    }
  }

  async isChannelEventHubConnected() {
    for (var [channel_name, channel] of this.client.getChannels().entries()) {
      // validate channel event is connected
      let status = this.eventHub.isChannelEventHubConnected(channel_name);
      if (status) {
        await this.syncService.synchBlocks(this.client, channel);
      } else {
        // channel client is not connected then it will reconnect
        this.eventHub.connectChannelEventHub(channel_name);
      }
    }
  }

  setBlocksSyncTime(blocksSyncTime) {
    if (blocksSyncTime) {
      let time = parseInt(blocksSyncTime, 10);
      if (!isNaN(time)) {
        //this.blocksSyncTime = 1 * 10 * 1000;
        this.blocksSyncTime = time * 60 * 1000;
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

  send(notify) {
    if (this.sender) {
      this.sender.send(notify);
    }
  }

  destroy() {
    if (this.eventHub) {
      this.eventHub.disconnectEventHubs();
    }
  }
}

module.exports = SyncPlatform;
