/*
    SPDX-License-Identifier: Apache-2.0
*/

const chaincodeService = require('./service/chaincodeService.js');
const helper = require('../../common/helper');

const logger = helper.getLogger('Proxy');

const ExplorerError = require('../../common/ExplorerError');

const fabric_const = require('./utils/FabricConst').fabric.const;
const explorer_error = require('../../common/ExplorerMessage').explorer.error;

class Proxy {
  constructor(platform) {
    this.platform = platform;
    this.persistence = platform.getPersistence();
    this.broadcaster = platform.getBroadcaster();
  }

  async getCurrentChannel() {
    const client = await this.platform.getClient();
    const channel = client.getDefaultChannel();
    const channel_genesis_hash = client.getChannelGenHash(channel.getName());
    let respose;
    if (channel_genesis_hash) {
      respose = { currentChannel: channel_genesis_hash };
    } else {
      respose = {
        status: 1,
        message: 'Channel not found in the Context ',
        currentChannel: ''
      };
    }
    logger.debug('getCurrentChannel >> %j', respose);
    return respose;
  }

  async loadChaincodeSrc(path) {
    const respose = chaincodeService.loadChaincodeSrc(path);
    logger.debug('loadChaincodeSrc >> %s', respose);
    return respose;
  }

  async getPeersStatus(channel_genesis_hash) {
    const client = await this.platform.getClient();
    const channel = client.getDefaultChannel();
    const nodes = await this.persistence
      .getMetricService()
      .getPeerList(channel_genesis_hash);
    let discover_results;
    if (client.status) {
      try {
        discover_results = await client.initializeChannelFromDiscover(
          channel._name
        );
      } catch (e) {}
    }
    const peers = [];
    for (const node of nodes) {
      if (node.peer_type === 'PEER') {
        const res = await client.getPeerStatus(node);
        node.status = res.status ? res.status : 'DOWN';
        if (discover_results && discover_results.peers_by_org) {
          const org = discover_results.peers_by_org[node.mspid];
          for (const peer of org.peers) {
            if (peer.endpoint.indexOf(node.server_hostname) > -1) {
              node.ledger_height_low = peer.ledger_height.low;
              node.ledger_height_high = peer.ledger_height.high;
              node.ledger_height_unsigned = peer.ledger_height.unsigned;
            }
          }
        }
        peers.push(node);
      }
    }
    logger.debug('getPeersStatus >> %j', peers);
    return peers;
  }

  async changeChannel(channel_genesis_hash) {
    const client = this.platform.getClient();
    const respose = client.setDefaultChannelByHash(channel_genesis_hash);
    logger.debug('changeChannel >> %s', respose);
    return respose;
  }

  async getChannelsInfo() {
    const client = this.platform.getClient();
    const channels = await this.persistence
      .getCrudService()
      .getChannelsInfo(client.getDefaultPeer().getName());
    const currentchannels = [];
    for (const channel of channels) {
      const channel_genesis_hash = client.getChannelGenHash(
        channel.channelname
      );
      if (
        channel_genesis_hash
        && channel_genesis_hash === channel.channel_genesis_hash
      ) {
        currentchannels.push(channel);
      }
    }
    logger.debug('getChannelsInfo >> %j', currentchannels);
    return currentchannels;
  }

  async getTxByOrgs(channel_genesis_hash) {
    const rows = await this.persistence
      .getMetricService()
      .getTxByOrgs(channel_genesis_hash);
    const organizations = await this.persistence
      .getMetricService()
      .getOrgsData(channel_genesis_hash);

    for (const organization of rows) {
      const index = organizations.indexOf(organization.creator_msp_id);
      if (index > -1) {
        organizations.splice(index, 1);
      }
    }
    for (const org_id of organizations) {
      rows.push({ count: '0', creator_msp_id: org_id });
    }
    return rows;
  }

  async getBlockByNumber(channel_genesis_hash, number) {
    const client = this.platform.getClient();
    const channel = client.getChannelByHash(channel_genesis_hash);

    const block = channel.queryBlock(
      parseInt(number),
      client.getDefaultPeer().getName(),
      true
    );

    if (block) {
      return block;
    }
    logger.error('response_payloads is null');
    return 'response_payloads is null';
  }

  async createChannel(artifacts) {
    const client = this.platform.getClient();
    const respose = await client.createChannel(artifacts);
    return respose;
  }

  async joinChannel(channelName, peers, orgName) {
    const client = this.platform.getClient();
    const respose = await client.joinChannel(channelName, peers, orgName);
    return respose;
  }

  getClientStatus() {
    const client = this.platform.getClient();
    return client.getStatus();
  }

  async getChannels() {
    const client = this.platform.getClient();
    const client_channels = client.getChannelNames();
    const channels = await this.persistence
      .getCrudService()
      .getChannelsInfo(client.getDefaultPeer().getName());
    const respose = [];

    for (let i = 0; i < channels.length; i++) {
      const index = client_channels.indexOf(channels[i].channelname);
      if (!(index > -1)) {
        await this.platform
          .getClient()
          .initializeNewChannel(channels[i].channelname);
      }
      respose.push(channels[i].channelname);
    }
    logger.debug('getChannels >> %j', respose);
    return respose;
  }

  processSyncMessage(msg) {
    // get message from child process
    logger.debug('Message from child %j', msg);
    if (fabric_const.NOTITY_TYPE_NEWCHANNEL === msg.notify_type) {
      // initialize new channel instance in parent
      if (msg.network_name && msg.client_name) {
        const client = this.platform.networks
          .get(msg.network_name)
          .get(msg.client_name);
        if (msg.channel_name) {
          client.initializeNewChannel(msg.channel_name);
        } else {
          logger.error(
            'Channel name should pass to proces the notification from child process'
          );
        }
      } else {
        logger.error(
          'Network name and client name should pass to proces the notification from child process'
        );
      }
    } else if (
      fabric_const.NOTITY_TYPE_UPDATECHANNEL === msg.notify_type
      || fabric_const.NOTITY_TYPE_CHAINCODE === msg.notify_type
    ) {
      // update channel details in parent
      if (msg.network_name && msg.client_name) {
        const client = this.platform.networks
          .get(msg.network_name)
          .get(msg.client_name);
        if (msg.channel_name) {
          client.initializeChannelFromDiscover(msg.channel_name);
        } else {
          logger.error(
            'Channel name should pass to proces the notification from child process'
          );
        }
      } else {
        logger.error(
          'Network name and client name should pass to proces the notification from child process'
        );
      }
    } else if (fabric_const.NOTITY_TYPE_BLOCK === msg.notify_type) {
      // broad cast new block message to client
      const notify = {
        title: msg.title,
        type: msg.type,
        message: msg.message,
        time: msg.time,
        txcount: msg.txcount,
        datahash: msg.datahash
      };
      this.broadcaster.broadcast(notify);
    } else if (fabric_const.NOTITY_TYPE_EXISTCHANNEL === msg.notify_type) {
      throw new ExplorerError(explorer_error.ERROR_2009, msg.channel_name);
    } else if (msg.error) {
      throw new ExplorerError(explorer_error.ERROR_2010, msg.error);
    } else {
      logger.error(
        'Child process notify is not implemented for this type %s ',
        msg.notify_type
      );
    }
  }
}

module.exports = Proxy;
