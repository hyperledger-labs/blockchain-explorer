/*
 *SPDX-License-Identifier: Apache-2.0
 */

var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var helper = require('../../helper.js');
var fileUtil = require('../../explorer/rest/logical/utils/fileUtils.js');
var logger = helper.getLogger('Query');
var configuration = require('./Configuration.js');
var BlockDecoder = require('fabric-client/lib/BlockDecoder.js');
var chaincodeService = require('./service/chaincodeService.js');
var jch = require('./service/joinChannel.js');

class Proxy {
  constructor(target, client, channels) {
    this.peerFailures = 0;
    this.target = target;
    this.client = client;
    this.channels = channels;
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

  queryChaincode(channelName, chaincodeName, fcn, args) {
    var channel = this.getChannel(channelName);

    //Let Cahnnel use second peer added
    if (peerFailures > 0) {
      let peerToRemove = channel.getPeers()[0];
      channel.removePeer(peerToRemove);
      channel.addPeer(peerToRemove);
    }
    tx_id = this.client.newTransactionID();
    // send query
    var request = {
      chaincodeId: chaincodeName,
      txId: tx_id,
      fcn: fcn,
      args: args
    };
    return channel.queryByChaincode(request, this.target);
  }

  getBlockByNumber(channelName, blockNumber) {
    var channel = this.getChannel(channelName);
    return channel
      .queryBlock(parseInt(blockNumber), this.target)
      .then(
        channelinfo => {
          if (channelinfo) {
            return channelinfo;
          } else {
            logger.error('response_payloads is null');
            return 'response_payloads is null';
          }
        },
        err => {
          logger.error(
            'Failed to send query due to error: ' + err.stack ? err.stack : err
          );
          return 'Failed to send query due to error: ' + err.stack
            ? err.stack
            : err;
        }
      )
      .catch(err => {
        logger.error(
          'Failed to query with error:' + err.stack ? err.stack : err
        );
        return 'Failed to query with error:' + err.stack ? err.stack : err;
      });
  }

  getTransactionByID(channelName, trxnID) {
    if (trxnID) {
      var channel = this.getChannel(channelName);
      return channel.queryTransaction(trxnID, this.target);
    }
    return {};
  }
  async getGenesisBlock(channelname) {
    if (channelname == null || channelname == undefined) {
      channelname = this.getDefaultChannel();
    }
    var channel = this.channels[channelname].channel;
    return channel.getGenesisBlock();
  }

  getBlockByHash(channelName, hash) {
    var channel = this.getChannel(channelName);
    return channel.queryBlockByHash(new Buffer(hash, 'hex'), this.target);
  }

  async getChainInfo(channelName) {
    var channel = this.getChannel(channelName);

    try {
      var blockchainInfo = await channel.queryInfo(this.target, true);

      if (blockchainInfo) {
        // FIXME: Save this for testing 'getBlockByHash'  ?
        logger.debug('===========================================');
        logger.debug(blockchainInfo.currentBlockHash);
        logger.debug('===========================================');
        //logger.debug(blockchainInfo);
        return blockchainInfo;
      } else {
        logger.error('response_payloads is null');
        return 'response_payloads is null';
      }
    } catch (err) {
      logger.error(
        'Failed to send query due to error: ' + err.stack ? err.stack : err
      );
      return 'Failed to send query due to error: ' + err.stack
        ? err.stack
        : err;
    }
  }

  //getInstalledChaincodes
  async getInstalledChaincodes(channelName, type) {
    var channel = this.getChannel(channelName);

    var response;

    try {
      if (type === 'installed') {
        response = await this.client.queryInstalledChaincodes(
          this.target,
          true
        );
      } else {
        response = await channel.queryInstantiatedChaincodes(this.target, true);
      }
    } catch (err) {
      logger.error(
        'Failed to send query due to error: ' + err.stack ? err.stack : err
      );
      return 'Failed to send query due to error: ' + err.stack
        ? err.stack
        : err;
    }

    if (response) {
      if (type === 'installed') {
        logger.debug('<<< Installed Chaincodes >>>');
      } else {
        logger.debug('<<< Instantiated Chaincodes >>>');
      }
      var details = [];
      for (let i = 0; i < response.chaincodes.length; i++) {
        let detail = {};
        logger.debug(
          'name: ' +
            response.chaincodes[i].name +
            ', version: ' +
            response.chaincodes[i].version +
            ', path: ' +
            response.chaincodes[i].path
        );
        detail.name = response.chaincodes[i].name;
        detail.version = response.chaincodes[i].version;
        detail.path = response.chaincodes[i].path;
        details.push(detail);
      }
      return details;
    } else {
      logger.error('response is null');
      return 'response is null';
    }
  }

  getOrganizations(channelName) {
    var channel = this.getChannel(channelName);
    return channel.getOrganizations();
  }

  getConnectedPeers(channelName) {
    return this.getChannel(channelName).getPeers();
  }

  //Orderer Info BE-303
  getConnectedOrderers(channelName) {
    return this.getChannel(channelName).getOrderers();
  }
  //Orderer Info BE-303

  async getChannelHeight(channelName) {
    var response = await this.getChainInfo(channelName);
    if (response && response.height) {
      return response.height.low.toString();
    }
    return '0';
  }

  async syncChannelEventHubBlock(callback) {
    var fabChannels = this.getChannelObjects();
    fabChannels.forEach(fabChannel => {
      var channel_event_hub = fabChannel.channelEventHub;
      channel_event_hub.connect(true);
      channel_event_hub.registerBlockEvent(
        function(block) {
          console.log('Successfully received the block event' + block);
          if (block.data != undefined) {
            //full block

            try {
              callback(block, fabChannel.channelName);
            } catch (err) {
              console.log(err.stack);
              logger.error(err);
            }
          } else {
            //filtered block
            console.log('The block number' + block.number);
            console.log('The filtered_tx' + block.filtered_tx);
            console.log('The block event channel_id' + block.channel_id);
          }
        },
        error => {
          console.log('Failed to receive the block event ::' + error);
        }
      );
    });
  }

  async queryChannels() {
    try {
      var channelInfo = await this.client.queryChannels(this.target);
      if (channelInfo) {
        return channelInfo;
      } else {
        logger.error('response_payloads is null');
        return 'response_payloads is null';
      }
    } catch (err) {
      logger.error(
        'Failed to send query due to error: ' + err.stack ? err.stack : err
      );
      return 'Failed to send query due to error: ' + err.stack
        ? err.stack
        : err;
    }
  }
  async getGenesisBlockHash(channelname) {
    let genesisBlock = await this.getGenesisBlock(channelname);
    let temp = BlockDecoder.decodeBlock(genesisBlock);
    let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
    return genesisBlockHash;
  }
  async getCurBlockNum(channelName) {
    try {
      var row = await sql.getRowsBySQlCase(
        `select max(blocknum) as blocknum from blocks  where channelname='${channelName}'`
      );
    } catch (err) {
      logger.error(err);
      return -1;
    }

    let curBlockNum;

    if (row == null || row.blocknum == null) {
      curBlockNum = -1;
    } else {
      curBlockNum = parseInt(row.blocknum);
    }

    return curBlockNum;
  }

  joinChannel(channelName, peers, orgName, platform) {
    let jc = jch.joinChannel(channelName, peers, orgName, platform);
    return jc;
  }

  getDefaultChannel() {
    return configuration.getCurrChannel();
  }

  changeChannel(channel) {
    return configuration.changeChannel(channel);
  }

  async loadChaincodeSrc(path) {
    return chaincodeService.loadChaincodeSrc(path);
  }

  getSyncStartDate() {
    return configuration.getSyncStartDate();
  }
}

module.exports = Proxy;
