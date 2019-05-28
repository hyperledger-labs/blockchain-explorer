/*
    SPDX-License-Identifier: Apache-2.0
*/

const grpc = require('grpc');
const convertHex = require('convert-hex');
const helper = require('../../../common/helper');

const logger = helper.getLogger('SyncServices');
const ExplorerError = require('../../../common/ExplorerError');
const FabricUtils = require('../../../platform/fabric/utils/FabricUtils');
const fabric_const = require('../../../platform/fabric/utils/FabricConst')
  .fabric.const;
const explorer_error = require('../../../common/ExplorerMessage').explorer
  .error;

const _transProto = grpc.load(
  `${__dirname}/../../../../node_modules/fabric-client/lib/protos/peer/transaction.proto`
).protos;

const blocksInProcess = [];

// transaction validation code
const _validation_codes = {};
const keys = Object.keys(_transProto.TxValidationCode);
for (let i = 0; i < keys.length; i++) {
  const new_key = _transProto.TxValidationCode[keys[i]];
  _validation_codes[new_key] = keys[i];
}

// transaction validation code
function convertValidationCode(code) {
  if (typeof code === 'string') {
    return code;
  }
  return _validation_codes[code];
}

class SyncServices {
  constructor(platform, persistence) {
    this.platform = platform;
    this.persistence = persistence;
    this.blocks = [];
    this.synchInProcess = [];
  }

  async initialize() {}

  async synchNetworkConfigToDB(client) {
    const channels = client.getChannels();
    for (const [channel_name, channel] of channels.entries()) {
      const block = await client.getGenesisBlock(channel);
      const channel_genesis_hash = await FabricUtils.generateBlockHash(
        block.header
      );
      const res = await this.insertNewChannel(
        client,
        channel,
        block,
        channel_genesis_hash
      );
      if (res) {
        await this.insertFromDiscoveryResults(
          client,
          channel,
          channel_genesis_hash
        );
      } else {
        return false;
      }
    }
    return true;
  }

  // insert new channel to DB
  async insertNewChannel(client, channel, block, channel_genesis_hash) {
    const channel_name = channel.getName();

    const channelInfo = await this.persistence
      .getCrudService()
      .getChannel(channel_name, channel_genesis_hash);

    if (!channelInfo) {
      const count = await this.persistence
        .getCrudService()
        .existChannel(channel_name);
      if (count.count === '0') {
        if (block.data && block.data.data.length > 0 && block.data.data[0]) {
          const createdt = await FabricUtils.getBlockTimeStamp(
            block.data.data[0].payload.header.channel_header.timestamp
          );
          const channel_row = {
            name: channel_name,
            createdt,
            blocks: 0,
            trans: 0,
            channel_hash: '',
            channel_version:
              block.data.data[0].payload.header.channel_header.version,
            channel_genesis_hash
          };
          await this.persistence.getCrudService().saveChannel(channel_row);
        }
      } else {
        const notify = {
          notify_type: fabric_const.NOTITY_TYPE_EXISTCHANNEL,
          network_name: this.platform.network_name,
          client_name: client.client_name,
          channel_name
        };
        this.platform.send(notify);
        throw new ExplorerError(explorer_error.ERROR_2013, channel_name);
      }
    }
    return true;
  }

  async insertFromDiscoveryResults(client, channel, channel_genesis_hash) {
    const channel_name = channel.getName();
    const discoveryResults = await client.initializeChannelFromDiscover(
      channel_name
    );
    // insert peer
    if (discoveryResults && discoveryResults.peers_by_org) {
      for (const org_name in discoveryResults.peers_by_org) {
        const org = discoveryResults.peers_by_org[org_name];
        for (const peer of org.peers) {
          await this.insertNewPeer(peer, channel_genesis_hash, client);
        }
      }
    }
    // insert orderer
    if (discoveryResults && discoveryResults.orderers) {
      for (const org_name in discoveryResults.orderers) {
        const org = discoveryResults.orderers[org_name];
        for (const orderer of org.endpoints) {
          orderer.org_name = org_name;
          await this.insertNewOrderers(orderer, channel_genesis_hash, client);
        }
      }
    }
    // insert chaincode
    await this.insertNewChannelChaincode(
      client,
      channel,
      channel_genesis_hash,
      discoveryResults
    );
  }

  // insert new peer and channel relation
  async insertNewPeer(peer, channel_genesis_hash, client) {
    let eventurl = '';
    let requesturl = `grpcs://${peer.endpoint}`;
    const host_port = peer.endpoint.split(':');
    if (
      client.client_config.peers &&
      client.client_config.peers[host_port[0]] &&
      client.client_config.peers[host_port[0]].url
    ) {
      requesturl = client.client_config.peers[host_port[0]].url;
    }
    if (
      client.client_config.peers &&
      client.client_config.peers[host_port[0]] &&
      client.client_config.peers[host_port[0]].eventUrl
    ) {
      eventurl = client.client_config.peers[host_port[0]].eventUrl;
    }

    const peer_row = {
      mspid: peer.mspid,
      requests: requesturl,
      events: eventurl,
      server_hostname: host_port[0],
      channel_genesis_hash,
      peer_type: 'PEER'
    };
    await this.persistence.getCrudService().savePeer(peer_row);
    const channel_peer_row = {
      peerid: host_port[0],
      channelid: channel_genesis_hash
    };
    await this.persistence
      .getCrudService()
      .savePeerChannelRef(channel_peer_row);
  }

  // insert new orderer and channel relation
  async insertNewOrderers(orderer, channel_genesis_hash, client) {
    let requesturl = `${orderer.host}:${orderer.port}`;
    if (
      client.client_config.orderers &&
      client.client_config.orderers[orderer.host] &&
      client.client_config.orderers[orderer.host].url
    ) {
      requesturl = client.client_config.orderers[orderer.host].url;
    }
    const orderer_row = {
      mspid: orderer.org_name,
      requests: requesturl,
      server_hostname: orderer.host,
      channel_genesis_hash,
      peer_type: 'ORDERER'
    };
    await this.persistence.getCrudService().savePeer(orderer_row);
    const channel_orderer_row = {
      peerid: orderer.host,
      channelid: channel_genesis_hash
    };
    await this.persistence
      .getCrudService()
      .savePeerChannelRef(channel_orderer_row);
  }

  // insert new chaincode, peer and channel relation
  async insertNewChannelChaincode(
    client,
    channel,
    channel_genesis_hash,
    discoveryResults
  ) {
    const chaincodes = await channel.queryInstantiatedChaincodes(
      client.getDefaultPeer(),
      true
    );
    for (const chaincode of chaincodes.chaincodes) {
      const chaincode_row = {
        name: chaincode.name,
        version: chaincode.version,
        path: chaincode.path,
        txcount: 0,
        createdt: new Date(),
        channel_genesis_hash
      };
      await this.persistence.getCrudService().saveChaincode(chaincode_row);
      if (discoveryResults && discoveryResults.peers_by_org) {
        for (const org_name in discoveryResults.peers_by_org) {
          const org = discoveryResults.peers_by_org[org_name];
          for (const peer of org.peers) {
            for (const c_code of peer.chaincodes) {
              if (
                c_code.name === chaincode.name &&
                c_code.version === chaincode.version
              ) {
                await this.insertNewChaincodePeerRef(
                  c_code,
                  peer.endpoint,
                  channel_genesis_hash
                );
              }
            }
          }
        }
      }
    }
  }

  // insert new chaincode relation with peer and channel
  async insertNewChaincodePeerRef(chaincode, endpoint, channel_genesis_hash) {
    const host_port = endpoint.split(':');
    const chaincode_peer_row = {
      chaincodeid: chaincode.name,
      cc_version: chaincode.version,
      peerid: host_port[0],
      channelid: channel_genesis_hash
    };
    await this.persistence
      .getCrudService()
      .saveChaincodPeerRef(chaincode_peer_row);
  }

  async synchBlocks(client, channel) {
    const client_name = client.getClientName();
    const channel_name = channel.getName();

    const synch_key = `${client_name}_${channel_name}`;
    if (this.synchInProcess.includes(synch_key)) {
      logger.info(
        `Block synch in process for >> ${client_name}_${channel_name}`
      );
      return;
    }
    this.synchInProcess.push(synch_key);

    // get channel information from ledger
    const channelInfo = await client
      .getHFC_Client()
      .getChannel(channel_name)
      .queryInfo(client.getDefaultPeer(), true);
    const channel_genesis_hash = client.getChannelGenHash(channel_name);
    const blockHeight = parseInt(channelInfo.height.low) - 1;
    // query missing blocks from DB
    const results = await this.persistence
      .getMetricService()
      .findMissingBlockNumber(channel_genesis_hash, blockHeight);

    if (results) {
      for (const result of results) {
        // get block by number
        const block = await client
          .getHFC_Client()
          .getChannel(channel_name)
          .queryBlock(
            result.missing_id,
            client.getDefaultPeer().getName(),
            true
          );
        await this.processBlockEvent(client, block);
      }
    } else {
      logger.debug('Missing blocks not found for %s', channel_name);
    }
    const index = this.synchInProcess.indexOf(synch_key);
    this.synchInProcess.splice(index, 1);
  }

  async processBlockEvent(client, block) {
    const _self = this;
    // get the first transaction
    const first_tx = block.data.data[0];
    // the 'header' object contains metadata of the transaction
    const { header } = first_tx.payload;
    const channel_name = header.channel_header.channel_id;
    const blockPro_key = `${channel_name}_${block.header.number}`;

    if (blocksInProcess.includes(blockPro_key)) {
      return 'Block already in processing';
    }
    blocksInProcess.push(blockPro_key);

    logger.debug('New Block  >>>>>>> %j', block);
    let channel_genesis_hash = client.getChannelGenHash(channel_name);
    // checking block is channel CONFIG block
    if (!channel_genesis_hash) {
      // get discovery and insert channel details to db
      // create new channel object in client context
      setTimeout(
        async (client, channel_name, block) => {
          await client.initializeNewChannel(channel_name);
          channel_genesis_hash = client.getChannelGenHash(channel_name);
          // inserting new channel details to DB
          const channel = client.hfc_client.getChannel(channel_name);
          await _self.insertNewChannel(
            client,
            channel,
            block,
            channel_genesis_hash
          );
          await _self.insertFromDiscoveryResults(
            client,
            channel,
            channel_genesis_hash
          );

          const notify = {
            notify_type: fabric_const.NOTITY_TYPE_NEWCHANNEL,
            network_name: _self.platform.network_name,
            client_name: client.client_name,
            channel_name
          };

          _self.platform.send(notify);
        },
        10000,
        client,
        channel_name,
        block
      );
    } else if (
      header.channel_header.typeString === fabric_const.BLOCK_TYPE_CONFIG
    ) {
      setTimeout(
        async (client, channel_name, channel_genesis_hash) => {
          // get discovery and insert new peer, orders details to db
          const channel = client.hfc_client.getChannel(channel_name);
          await client.initializeChannelFromDiscover(channel_name);
          await _self.insertFromDiscoveryResults(
            client,
            channel,
            channel_genesis_hash
          );
          const notify = {
            notify_type: fabric_const.NOTITY_TYPE_UPDATECHANNEL,
            network_name: _self.platform.network_name,
            client_name: client.client_name,
            channel_name
          };

          _self.platform.send(notify);
        },
        10000,
        client,
        channel_name,
        channel_genesis_hash
      );
    }
    const createdt = await FabricUtils.getBlockTimeStamp(
      header.channel_header.timestamp
    );
    const blockhash = await FabricUtils.generateBlockHash(block.header);
    if (channel_genesis_hash) {
      const block_row = {
        blocknum: block.header.number,
        datahash: block.header.data_hash,
        prehash: block.header.previous_hash,
        txcount: block.data.data.length,
        createdt,
        prev_blockhash: '',
        blockhash,
        channel_genesis_hash
      };
      const txLen = block.data.data.length;
      for (let i = 0; i < txLen; i++) {
        const txObj = block.data.data[i];
        const txid = txObj.payload.header.channel_header.tx_id;
        let validation_code = '';
        let endorser_signature = '';
        let payload_proposal_hash = '';
        let endorser_id_bytes = '';
        let chaincode_proposal_input = '';
        let chaincode = '';
        let rwset;
        let readSet;
        let writeSet;
        let chaincodeID;
        let status;
        let mspId = [];
        if (txid != undefined && txid != '') {
          const validation_codes =
            block.metadata.metadata[block.metadata.metadata.length - 1];
          const val_code = validation_codes[i];
          validation_code = convertValidationCode(val_code);
        }
        let envelope_signature = txObj.signature;
        if (envelope_signature != undefined) {
          envelope_signature = convertHex.bytesToHex(envelope_signature);
        }
        let payload_extension = txObj.payload.header.channel_header.extension;
        if (payload_extension != undefined) {
          payload_extension = convertHex.bytesToHex(payload_extension);
        }
        let creator_nonce = txObj.payload.header.signature_header.nonce;
        if (creator_nonce != undefined) {
          creator_nonce = convertHex.bytesToHex(creator_nonce);
        }
        const creator_id_bytes =
          txObj.payload.header.signature_header.creator.IdBytes;
        if (txObj.payload.data.actions != undefined) {
          chaincode =
            txObj.payload.data.actions[0].payload.action
              .proposal_response_payload.extension.chaincode_id.name;
          chaincodeID = new Uint8Array(
            txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension
          );
          status =
            txObj.payload.data.actions[0].payload.action
              .proposal_response_payload.extension.response.status;
          mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(
            i => i.endorser.Mspid
          );
          rwset =
            txObj.payload.data.actions[0].payload.action
              .proposal_response_payload.extension.results.ns_rwset;
          readSet = rwset.map(i => ({
            chaincode: i.namespace,
            set: i.rwset.reads
          }));
          writeSet = rwset.map(i => ({
            chaincode: i.namespace,
            set: i.rwset.writes
          }));
          chaincode_proposal_input =
            txObj.payload.data.actions[0].payload.chaincode_proposal_payload
              .input.chaincode_spec.input.args;
          if (chaincode_proposal_input != undefined) {
            let inputs = '';
            for (const input of chaincode_proposal_input) {
              inputs =
                (inputs === '' ? inputs : `${inputs},`) +
                convertHex.bytesToHex(input);
            }
            chaincode_proposal_input = inputs;
          }
          endorser_signature =
            txObj.payload.data.actions[0].payload.action.endorsements[0]
              .signature;
          if (endorser_signature != undefined) {
            endorser_signature = convertHex.bytesToHex(endorser_signature);
          }
          payload_proposal_hash =
            txObj.payload.data.actions[0].payload.action
              .proposal_response_payload.proposal_hash;
          endorser_id_bytes =
            txObj.payload.data.actions[0].payload.action.endorsements[0]
              .endorser.IdBytes;
        }
        const read_set = JSON.stringify(readSet, null, 2);
        const write_set = JSON.stringify(writeSet, null, 2);

        const chaincode_id = String.fromCharCode.apply(null, chaincodeID);
        // checking new chaincode is deployed
        if (
          header.channel_header.typeString ===
            fabric_const.BLOCK_TYPE_ENDORSER_TRANSACTION &&
          chaincode === fabric_const.CHAINCODE_LSCC
        ) {
          setTimeout(
            async (client, channel_name, channel_genesis_hash) => {
              const channel = client.hfc_client.getChannel(channel_name);
              // get discovery and insert chaincode details to db
              await _self.insertFromDiscoveryResults(
                client,
                channel,
                channel_genesis_hash
              );

              const notify = {
                notify_type: fabric_const.NOTITY_TYPE_CHAINCODE,
                network_name: _self.platform.network_name,
                client_name: client.client_name,
                channel_name
              };

              _self.platform.send(notify);
            },
            10000,
            client,
            channel_name,
            channel_genesis_hash
          );
        }
        const transaction_row = {
          blockid: block.header.number,
          txhash: txObj.payload.header.channel_header.tx_id,
          createdt,
          chaincodename: chaincode,
          chaincode_id,
          status,
          creator_msp_id: txObj.payload.header.signature_header.creator.Mspid,
          endorser_msp_id: mspId,
          type: txObj.payload.header.channel_header.typeString,
          read_set,
          write_set,
          channel_genesis_hash,
          validation_code,
          envelope_signature,
          payload_extension,
          creator_nonce,
          chaincode_proposal_input,
          endorser_signature,
          creator_id_bytes,
          payload_proposal_hash,
          endorser_id_bytes
        };

        // insert transaction
        await this.persistence
          .getCrudService()
          .saveTransaction(transaction_row);
      }
      // insert block
      const status = await this.persistence
        .getCrudService()
        .saveBlock(block_row);
      if (status) {
        // push last block
        const notify = {
          notify_type: fabric_const.NOTITY_TYPE_BLOCK,
          network_name: _self.platform.network_name,
          client_name: client.client_name,
          channel_name,
          title: `Block ${
            block.header.number
          } added to Channel: ${channel_name}`,
          type: 'block',
          message: `Block ${block.header.number} established with ${
            block.data.data.length
          } tx`,
          time: createdt,
          txcount: block.data.data.length,
          datahash: block.header.data_hash
        };

        _self.platform.send(notify);
      }
    } else {
      logger.error('Failed to process the block %j', block);
    }
    const index = blocksInProcess.indexOf(blockPro_key);
    blocksInProcess.splice(index, 1);
  }

  getCurrentChannel() {}

  getPlatform() {
    return this.platform;
  }

  getPersistence() {
    return this.persistence;
  }
}

module.exports = SyncServices;
