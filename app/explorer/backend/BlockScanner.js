/*
 *SPDX-License-Identifier: Apache-2.0
 */

var helper = require('../../helper.js');
var logger = helper.getLogger('blockscanner');
var fileUtil = require('../rest/logical/utils/fileUtils.js');
var dateUtils = require('../rest/logical/utils/dateUtils.js');
var BlockDecoder = require('fabric-client/lib/BlockDecoder.js');
var convertHex = require('convert-hex');
var bytes = require('utf8-bytes');
var Enum = require('enum');

var myEnum = new Enum({
  VALID: 0,
  NIL_ENVELOPE: 1,
  BAD_PAYLOAD: 2,
  BAD_COMMON_HEADER: 3,
  BAD_CREATOR_SIGNATURE: 4,
  INVALID_ENDORSER_TRANSACTION: 5,
  INVALID_CONFIG_TRANSACTION: 6,
  UNSUPPORTED_TX_PAYLOAD: 7,
  BAD_PROPOSAL_TXID: 8,
  DUPLICATE_TXID: 9,
  ENDORSEMENT_POLICY_FAILURE: 10,
  MVCC_READ_CONFLICT: 11,
  PHANTOM_READ_CONFLICT: 12,
  UNKNOWN_TX_TYPE: 13,
  TARGET_CHAIN_NOT_FOUND: 14,
  MARSHAL_TX_ERROR: 15,
  NIL_TXACTION: 16,
  EXPIRED_CHAINCODE: 17,
  CHAINCODE_VERSION_CONFLICT: 18,
  BAD_HEADER_EXTENSION: 19,
  BAD_CHANNEL_HEADER: 20,
  BAD_RESPONSE_PAYLOAD: 21,
  BAD_RWSET: 22,
  ILLEGAL_WRITESET: 23,
  INVALID_OTHER_REASON: 255
});

class BlockScanner {
  constructor(platform, persistence, broadcaster) {
    this.proxy = platform.getDefaultProxy();
    this.crudService = persistence.getCrudService();
    this.broadcaster = broadcaster;
  }

  async syncBlock() {
    try {
      // sync block data historicaly
      var syncStartDate = this.proxy.getSyncStartDate();
      var channels = this.proxy.getChannels();

      for (let channelName of channels) {
        let maxBlockNum;
        let curBlockNum;
        let genesisBlockHash = await this.proxy.getGenesisBlockHash(
          channelName
        );
        [maxBlockNum, curBlockNum] = await Promise.all([
          this.getMaxBlockNum(channelName),
          this.crudService.getCurBlockNum(genesisBlockHash)
        ]);

        if (syncStartDate) {
          await this.syncBlocksFromDate(
            channelName,
            maxBlockNum,
            syncStartDate
          );
        } else {
          await this.getBlockByNumber(
            channelName,
            curBlockNum + 1,
            maxBlockNum
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getBlockTimeStamp(block) {
    var blockTimestamp = null;
    try {
      if (block && block.data && block.data.data[0]) {
        let first_tx = block.data.data[0];
        let header = first_tx.payload.header;
        blockTimestamp = header.channel_header.timestamp;
      }
    } catch (err) {
      logger.error(err);
    }
    return blockTimestamp;
  }
  async saveBlockRange(block, channelName) {
    let first_tx = block.data.data[0]; //get the first Transaction
    let header = first_tx.payload.header; //the "header" object contains metadata of the transaction
    let firstTxTimestamp = header.channel_header.timestamp;
    if (!firstTxTimestamp) {
      firstTxTimestamp = null;
    }
    let genesisBlock = await this.proxy.getGenesisBlock(channelName);
    let temp = BlockDecoder.decodeBlock(genesisBlock);
    let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
    let blockhash = await fileUtil.generateBlockHash(block.header);
    var blockRecord = {
      blockNum: block.header.number,
      txCount: block.data.data.length,
      preHash: block.header.previous_hash,
      dataHash: block.header.data_hash,
      firstTxTimestamp: header.channel_header.timestamp,
      blockhash: blockhash,
      channel_genesis_hash: genesisBlockHash
    };

    var blockSaved = await this.crudService.saveBlock(blockRecord);

    if (blockSaved) {
      //push last block
      var notify = {
        title: 'Block ' + block.header.number + ' added to: ' + channelName,
        channelName: channelName,
        type: 'block',
        message:
          'Block ' +
          block.header.number +
          ' established with ' +
          block.data.data.length +
          ' tx',
        time: new Date(firstTxTimestamp),
        txcount: block.data.data.length,
        datahash: block.header.data_hash
      };

      this.broadcaster.broadcast(notify);
      await this.saveTransactions(block, channelName);
    }
  }

  async saveTransactions(block, channelName) {
    //////////chaincode//////////////////
    //syncChaincodes();
    //////////tx/////////////////////////
    let txLen = block.data.data.length;
    for (let i = 0; i < txLen; i++) {
      let txObj = block.data.data[i];
      let txid = txObj.payload.header.channel_header.tx_id;
      let response = {};
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
      let channelName = txObj.payload.header.channel_header.channel_id;
      if (txid != undefined && txid != '') {
        var processedTransaction = await this.proxy.getTransactionByID(
          channelName,
          txid
        );
        txObj = processedTransaction.transactionEnvelope;
        validation_code = myEnum.get(
          parseInt(processedTransaction.validationCode)
        ).key;
      }
      let envelope_signature = txObj.signature;
      if (envelope_signature != undefined)
        envelope_signature = convertHex.bytesToHex(envelope_signature);
      let payload_extension = txObj.payload.header.channel_header.extension;
      if (payload_extension != undefined)
        payload_extension = convertHex.bytesToHex(payload_extension);
      let creator_nonce = txObj.payload.header.signature_header.nonce;
      if (creator_nonce != undefined)
        creator_nonce = convertHex.bytesToHex(creator_nonce);
      let creator_id_bytes =
        txObj.payload.header.signature_header.creator.IdBytes;
      if (txObj.payload.data.actions != undefined) {
        chaincode_proposal_input =
          txObj.payload.data.actions[0].payload.chaincode_proposal_payload.input
            .args;
        response =
          txObj.payload.data.actions[0].payload.chaincode_proposal_payload.input
            .chaincode_spec;
        if (chaincode_proposal_input != undefined) {
          let inputs = '';
          let dec = new StringDecoder('utf-8');
          let args = [];
          for (let input of chaincode_proposal_input) {
            inputs =
              (inputs === '' ? inputs : inputs + ',') +
              convertHex.bytesToHex(input);
            args.push(dec.write(input));
          }
          response.input.args = args;
          chaincode_proposal_input = inputs;
        }
        endorser_signature =
          txObj.payload.data.actions[0].payload.action.endorsements[0]
            .signature;
        if (endorser_signature != undefined)
          endorser_signature = convertHex.bytesToHex(endorser_signature);
        payload_proposal_hash =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .proposal_hash;
        endorser_id_bytes =
          txObj.payload.data.actions[0].payload.action.endorsements[0].endorser
            .IdBytes;
        chaincode =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.chaincode_id.name;
        rwset =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.results.ns_rwset;
        readSet = rwset.map(i => {
          return {
            chaincode: i.namespace,
            set: i.rwset.reads
          };
        });
        writeSet = rwset.map(i => {
          return {
            chaincode: i.namespace,
            set: i.rwset.writes
          };
        });
        chaincodeID = new Uint8Array(
          txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension
        );
        status =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.response.status;
        mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(
          i => {
            return i.endorser.Mspid;
          }
        );
      }
      let genesisBlock = await this.proxy.getGenesisBlock(channelName);
      let temp = BlockDecoder.decodeBlock(genesisBlock);
      let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
      var transaction = {
        blockid: block.header.number.toString(),
        txhash: txObj.payload.header.channel_header.tx_id,
        createdt: new Date(txObj.payload.header.channel_header.timestamp),
        chaincodename: chaincode,
        chaincode_id: String.fromCharCode.apply(null, chaincodeID),
        status: status,
        creator_msp_id: txObj.payload.header.signature_header.creator.Mspid,
        endorser_msp_id: mspId,
        tx_response: JSON.stringify(response),
        type: txObj.payload.header.channel_header.typeString,
        read_set: JSON.stringify(readSet, null, 2),
        write_set: JSON.stringify(writeSet, null, 2),
        channel_genesis_hash: genesisBlockHash,
        validation_code: validation_code,
        envelope_signature: envelope_signature,
        payload_extension: payload_extension,
        creator_nonce: creator_nonce,
        chaincode_proposal_input: chaincode_proposal_input,
        endorser_signature: endorser_signature,
        creator_id_bytes: creator_id_bytes,
        payload_proposal_hash: payload_proposal_hash,
        endorser_id_bytes: endorser_id_bytes
      };
      await this.crudService.saveTransaction(transaction);
    }
  }

  /**
   *
   * @param {*} channelName
   * @param {*} maxBlockNum
   * @param {*} syncStartDate
   * Method provides the ability to sync based on configured property syncStartDate in config.json
   */
  async syncBlocksFromDate(channelName, maxBlockNum, syncStartDate) {
    var applyFilter = syncStartDate ? true : false;
    var saveRecord = true;
    var END = 0;
    var START = maxBlockNum - 1;
    // get blocks backwards
    while (END <= START) {
      saveRecord = false;
      try {
        let block = await this.proxy.getBlockByNumber(channelName, START);
        if (block && applyFilter) {
          let blockTimeStamp = await this.getBlockTimeStamp(block);
          let blockUTC = dateUtils.toUTCmilliseconds(blockTimeStamp);

          if (blockUTC && syncStartDate) {
            if (blockUTC >= syncStartDate) {
              saveRecord = true;
            } else {
              saveRecord = false;
            }
          }
        }
        if (saveRecord) {
          try {
            var savedNewBlock = await this.saveBlockRange(block, channelName);
            if (savedNewBlock) {
              this.broadcaster.broadcast();
            }
          } catch (err) {
            console.log(err.stack);
            logger.error(err);
          }
        }
      } catch (err) {
        logger.error(err);
      }
      // decrease the block number
      START--;
    }
  }
  async getBlockByNumber(channelName, start, end) {
    while (start < end) {
      let block = await this.proxy.getBlockByNumber(channelName, start);

      try {
        var savedNewBlock = await this.saveBlockRange(block, channelName);
        if (savedNewBlock) {
          this.broadcaster.broadcast();
        }
      } catch (err) {
        console.log(err.stack);
        logger.error(err);
      }
      start++;
    }
  }

  calculateBlockHash(header) {
    let headerAsn = asn.define('headerAsn', function() {
      this.seq().obj(
        this.key('Number').int(),
        this.key('PreviousHash').octstr(),
        this.key('DataHash').octstr()
      );
    });

    let output = headerAsn.encode(
      {
        Number: parseInt(header.number),
        PreviousHash: Buffer.from(header.previous_hash, 'hex'),
        DataHash: Buffer.from(header.data_hash, 'hex')
      },
      'der'
    );
    let hash = sha.sha256(output);
    return hash;
  }

  async getMaxBlockNum(channelName) {
    try {
      var data = await this.proxy.getChannelHeight(channelName);
      return data;
    } catch (err) {
      logger.error(err);
    }
  }

  // ====================chaincodes=====================================
  async saveChaincodes(channelName) {
    let chaincodes = await this.proxy.getInstalledChaincodes(
      channelName,
      'Instantiated'
    );
    let len = chaincodes.length;
    if (typeof chaincodes === 'string') {
      logger.debug(chaincodes);
      return;
    }
    let genesisBlock = await this.proxy.getGenesisBlock(channelName);
    let temp = BlockDecoder.decodeBlock(genesisBlock);
    let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
    for (let i = 0; i < len; i++) {
      let chaincode = chaincodes[i];
      chaincode.channel_genesis_hash = genesisBlockHash;
      this.crudService.saveChaincode(chaincode);
    }
  }

  async saveChannel() {
    var channels = this.proxy.getChannels();
    for (let i = 0; i < channels.length; i++) {
      let date = new Date();
      let genesisBlock = await this.proxy.getGenesisBlock(channels[i]);
      let temp = BlockDecoder.decodeBlock(genesisBlock);
      let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
      var channel = {
        blocks: 0,
        trans: 0,
        name: channels[i],
        createdt: date,
        channel_hash: '',
        channel_genesis_hash: genesisBlockHash
      };
      channel.blocks = await this.proxy.getChannelHeight(channel.name);
      for (let j = 0; j < channel.blocks; j++) {
        let block = await this.proxy.getBlockByNumber(channel.name, j);
        channel.trans += block.data.data.length;
        if (j == 0) {
          channel.createdt = new Date(
            block.data.data[0].payload.header.channel_header.timestamp
          );
        }
        if (j == channel.blocks - 1) {
          channel.channel_hash =
            block.data.data[
              block.data.data.length - 1
            ].payload.header.channel_header.tx_id;
        }
      }

      this.crudService.saveChannel(channel);
    }
  }

  async syncChannels() {
    try {
      await this.saveChannel();
    } catch (err) {
      logger.error(err);
    }
  }

  async savePeerlist(channelName) {
    var peerlists = await this.proxy.getConnectedPeers(channelName);
    let genesisBlock = await this.proxy.getGenesisBlock(channelName);
    let temp = BlockDecoder.decodeBlock(genesisBlock);
    let genesisBlockHash = await fileUtil.generateBlockHash(temp.header);
    let peerlen = peerlists.length;
    for (let i = 0; i < peerlen; i++) {
      var peers = {};
      let peerlist = peerlists[i].getPeer();
      peers.requests = peerlist.getUrl();
      peers.channel_genesis_hash = genesisBlockHash;
      if (peerlist._options['grpc.default_authority']) {
        peers.server_hostname = peerlist._options['grpc.default_authority'];
      } else {
        peers.server_hostname =
          peerlist._options['grpc.ssl_target_name_override'];
      }
      this.crudService.savePeer(peers);
    }
  }
  // ====================Orderer BE-303=====================================
  async saveOrdererlist(channelName) {
    var ordererlists = await this.proxy.getConnectedOrderers(channelName);
    let ordererlen = ordererlists.length;
    for (let i = 0; i < ordererlen; i++) {
      var orderers = {};
      let ordererlist = ordererlists[i];
      orderers.requests = ordererlist._url;
      if (ordererlist._options['grpc.default_authority']) {
        orderers.server_hostname =
          ordererlist._options['grpc.default_authority'];
      } else {
        orderers.server_hostname =
          ordererlist._options['grpc.ssl_target_name_override'];
      }
      this.crudService.saveOrderer(orderers);
    }
  }
  // ====================Orderer BE-303=====================================
  async syncChaincodes() {
    try {
      var channels = this.proxy.getChannels();

      for (let channelName of channels) {
        this.saveChaincodes(channelName);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  syncPeerlist() {
    try {
      var channels = this.proxy.getChannels();

      for (let channelName of channels) {
        this.savePeerlist(channelName);
      }
    } catch (err) {
      logger.error(err);
    }
  }
  // ====================Orderer BE-303=====================================
  syncOrdererlist() {
    try {
      var channels = this.proxy.getChannels();
      for (let channelName of channels) {
        this.saveOrdererlist(channelName);
      }
    } catch (err) {
      logger.error(err);
    }
  }
  // ====================Orderer BE-303=====================================
  syncChannelEventHubBlock() {
    var self = this;
    this.proxy.syncChannelEventHubBlock((block, channelName) => {
      self.saveBlockRange(block, channelName);
    });
  }
}

module.exports = BlockScanner;
