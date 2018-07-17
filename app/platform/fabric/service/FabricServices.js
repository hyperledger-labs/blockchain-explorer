'use strict';

var fs = require('fs-extra');
var grpc = require('grpc');
var convertHex = require('convert-hex');
const BlockDecoder = require('fabric-client/lib/BlockDecoder');
var fileUtil = require('../../../explorer/rest/logical/utils/fileUtils.js');
var dateUtils = require('../../../explorer/rest/logical/utils/dateUtils.js');

var _transProto = grpc.load(__dirname + '/../../../../node_modules/fabric-client/lib/protos/peer/transaction.proto').protos;

const BLOCK_TYPE_CONFIG = 'CONFIG';
const BLOCK_TYPE_ENDORSER_TRANSACTION = 'ENDORSER_TRANSACTION';
const CHAINCODE_LSCC = 'lscc';


var _validation_codes = {};
var keys = Object.keys(_transProto.TxValidationCode);
for (let i = 0; i < keys.length; i++) {
    let new_key = _transProto.TxValidationCode[keys[i]];
    _validation_codes[new_key] = keys[i];
}

class FabricServices {

    constructor(platform, persistence, broadcaster) {
        this.platform = platform;
        this.persistence = persistence;
        this.broadcaster = broadcaster;
        this.blocks = [];
        this.synchInProcess = [];
    }

    async initialize() {

    }

    async synchNetworkConfigToDB() {
        let _self = this;
        let clients = this.platform.getClients();
        for (var [client_name, client] of clients.entries()) {
            let channels = client.getChannels();
            for (var [channel_name, channel] of channels.entries()) {

                let block = await this.getGenesisBlock(client, channel);
                let channel_genesis_hash = await this.generateBlockHash(block.header);

                await this.insertNewChannel(client, channel, block, channel_genesis_hash);
                await this.insertFromDiscoveryResults(client, channel, channel_genesis_hash);
            }
        }
    }

    async insertNewChannel(client, channel, block, channel_genesis_hash) {

        if (block.data && block.data.data.length > 0 && block.data.data[0]) {
            let channel_name = channel.getName();
            let createdt = await this.getBlockTimeStamp(block.data.data[0].payload.header.channel_header.timestamp);
            let channel_row = {
                "name": channel_name,
                "createdt": createdt,
                "blocks": 0,
                "trans": 0,
                "channel_hash": "",
                "channel_version": block.data.data[0].payload.header.channel_header.version,
                "genesis_block_hash": channel_genesis_hash
            }
            await this.persistence.getCrudService().saveChannel(channel_row);

        }
    }

    async insertFromDiscoveryResults(client, channel, channel_genesis_hash) {

        let channel_name = channel.getName();
        let discoveryResults = await client.initializeChannelFromDiscover(channel_name);

        if (discoveryResults && discoveryResults.peers_by_org) {
            for (let org_name in discoveryResults.peers_by_org) {
                let org = discoveryResults.peers_by_org[org_name];
                for (var peer of org.peers) {
                    await this.insertNewPeer(peer, channel_genesis_hash, client);
                }
            }
        }

        if (discoveryResults && discoveryResults.orderers) {

            for (let org_name in discoveryResults.orderers) {
                let org = discoveryResults.orderers[org_name];
                for (var orderer of org.endpoints) {
                    orderer.org_name = org_name;
                    await this.insertNewOrderers(orderer, channel_genesis_hash, client);
                }
            }
        }

        await this.insertNewChannelChaincode(client, channel, channel_genesis_hash, discoveryResults);


    }

    async insertNewPeer(peer, channel_genesis_hash, client) {

        let eventurl = "";
        let requesturl = peer.endpoint;

        if (client.client_config.peers && client.client_config.peers[requesturl] && client.client_config.peers[requesturl].url) {
            requesturl = client.client_config.peers[requesturl].url;
        }
        if (client.client_config.peers && client.client_config.peers[requesturl] && client.client_config.peers[requesturl].eventUrl) {
            eventurl = client.client_config.peers[requesturl].eventUrl;
        }

        const host_port = peer.endpoint.split(':');

        let peer_row = {
            "mspid": peer.mspid,
            "requests": requesturl,
            "events": eventurl,
            "server_hostname": host_port[0],
            "genesis_block_hash": channel_genesis_hash,
            "peer_type": "PEER"
        }
        await this.persistence.getCrudService().savePeer(peer_row);
        let channel_peer_row = {
            "peerid": host_port[0],
            "channelid": channel_genesis_hash
        }
        await this.persistence.getCrudService().savePeerChannelRef(channel_peer_row);

    }
    async insertNewOrderers(orderer, channel_genesis_hash, client) {

        let requesturl = orderer.host + ":" + orderer.port;

        if (client.client_config.orderers && client.client_config.orderers[requesturl] && client.client_config.orderers[requesturl].url) {
            requesturl = client.client_config.orderers[requesturl].url;
        }

        let orderer_row = {
            "mspid": orderer.org_name,
            "requests": requesturl,
            "server_hostname": orderer.host,
            "genesis_block_hash": channel_genesis_hash,
            "peer_type": "ORDERER"
        }
        await this.persistence.getCrudService().savePeer(orderer_row);
        let channel_orderer_row = {
            "peerid": orderer.host,
            "channelid": channel_genesis_hash
        }
        await this.persistence.getCrudService().savePeerChannelRef(channel_orderer_row);
    }

    async insertNewChannelChaincode(client, channel, channel_genesis_hash, discoveryResults) {

        let chaincodes = await channel.queryInstantiatedChaincodes(client.getDefaultPeer(), true);

        for (let chaincode of chaincodes.chaincodes) {
            let chaincode_row = {
                "name": chaincode.name,
                "version": chaincode.version,
                "path": chaincode.path,
                "txcount": 0,
                "createdt": new Date(),
                "genesis_block_hash": channel_genesis_hash
            }
            await this.persistence.getCrudService().saveChaincode(chaincode_row);

            if (discoveryResults && discoveryResults.peers_by_org) {
                for (let org_name in discoveryResults.peers_by_org) {
                    let org = discoveryResults.peers_by_org[org_name];
                    for (var peer of org.peers) {
                        for (var c_code of peer.chaincodes) {
                            if (c_code.name === chaincode.name && c_code.version === chaincode.version) {
                                await this.insertNewChaincodePeerRef(c_code, peer.endpoint, channel_genesis_hash);
                            }
                        }
                    }
                }
            }

        }

    }

    async insertNewChaincodePeerRef(chaincode, endpoint, channel_genesis_hash) {
        let host_port = endpoint.split(':');
        let chaincode_peer_row = {
            "chaincodeid": chaincode.name,
            "cc_version": chaincode.version,
            "peerid": host_port[0],
            "channelid": channel_genesis_hash
        }
        await this.persistence.getCrudService().saveChaincodPeerRef(chaincode_peer_row);
    }

    async synchBlocks(client_name, channel_name) {

        if (this.synchInProcess.includes(client_name + "_" + channel_name)) {
            console.log('Block synch in process for >> ' + client_name + "_" + channel_name);
            return;
        }
        let client = this.platform.getClient(client_name);

        let channelInfo = await client.getHFC_Client().getChannel(channel_name).queryInfo(client.getDefaultPeer(), true);
        let channel_genesis_hash = client.getChannelGenHash(channel_name);
        let blockHeight = (parseInt(channelInfo.height.low) - 1);
        let results = await this.persistence.getMetricService().findMissingBlockNumber(channel_genesis_hash, blockHeight);

        if (results) {
            for (let result of results) {
                //console.log('Missing Block Numbers' + JSON.stringify(result));
                let block = await client.getHFC_Client().getChannel(channel_name).queryBlock(result.missing_id, client.getDefaultPeer().getName(), true);
                //console.log('Missing Block Numbers' + JSON.stringify(block));
                await this.processBlockEvent(client, block);
            }
        } else {
            console.log('No Missing blocks found');
        }

        var index = this.synchInProcess.indexOf(client_name + "_" + channel_name);
        this.synchInProcess.splice(index, 1);

    }

    async processBlockEvent(client, block) {


        var first_tx = block.data.data[0]; // get the first transaction
        var header = first_tx.payload.header; // the "header" object contains metadata of the transaction
        var channel_name = header.channel_header.channel_id;

        //console.log('processBlockEvent : Channel name' + channel_name);

        //console.log('Process New Block validation_codes >>>>>>>' + JSON.stringify(block));        

        let channel_genesis_hash = client.getChannelGenHash(channel_name);

        //console.log('processBlockEvent : channel_genesis_hash' + channel_genesis_hash);

        //console.log('Header.channel_header.typeString >>>>>>> 1 '+header.channel_header.typeString);
        if (!channel_genesis_hash) {
            await client.initializeNewChannel(channel_name);
            channel_genesis_hash = client.getChannelGenHash(channel_name);
        } else if (header.channel_header.typeString === BLOCK_TYPE_CONFIG) {
            //console.log('Header.channel_header.typeString >>>>>>> 2 '+header.channel_header.typeString);
            let channel = client.hfc_client.getChannel(channel_name);
            await this.insertFromDiscoveryResults(client, channel, channel_genesis_hash);
        }

        //console.log('Process New Block  signature >>>>>>>' + JSON.stringify(first_tx.signature.toString()));

        //

        let createdt = await this.getBlockTimeStamp(header.channel_header.timestamp);
        let blockhash = await this.generateBlockHash(block.header);



        if (channel_genesis_hash) {

            let block_row = {
                "blocknum": block.header.number,
                "datahash": block.header.data_hash,
                "prehash": block.header.previous_hash,
                "txcount": block.data.data.length,
                "createdt": createdt,
                "prev_blockhash": '',
                "blockhash": blockhash,
                "genesis_block_hash": channel_genesis_hash
            }

            let txLen = block.data.data.length
            for (let i = 0; i < txLen; i++) {
                let txObj = block.data.data[i]
                let txid = txObj.payload.header.channel_header.tx_id;
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

                if (txid != undefined && txid != "") {

                    let validation_codes = block.metadata.metadata[block.metadata.metadata.length - 1];
                    let val_code;
                    if (!validation_codes) {
                        var processedTransaction = await client.getHFC_Client().getChannel(channel_name).queryTransaction(txid, client.getDefaultPeer(), true);
                        txObj = processedTransaction.transactionEnvelope;
                        val_code = processedTransaction.validationCode
                    } else {
                        //console.log('Process New Block validation_codes >>>>>>>' + JSON.stringify(validation_codes));
                        val_code = validation_codes[i];
                    }
                    validation_code = convertValidationCode(val_code);

                }
                let envelope_signature = txObj.signature;
                if (envelope_signature != undefined)
                    envelope_signature = convertHex.bytesToHex(envelope_signature)
                let payload_extension = txObj.payload.header.channel_header.extension;
                if (payload_extension != undefined)
                    payload_extension = convertHex.bytesToHex(payload_extension)
                let creator_nonce = txObj.payload.header.signature_header.nonce;
                if (creator_nonce != undefined)
                    creator_nonce = convertHex.bytesToHex(creator_nonce)
                let creator_id_bytes = txObj.payload.header.signature_header.creator.IdBytes;

                if (txObj.payload.data.actions != undefined) {
                    chaincode = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.chaincode_id.name;
                    chaincodeID = new Uint8Array(txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension);
                    status = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.status;
                    mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(i => { return i.endorser.Mspid });
                    //console.log('Process New Block  >>>>>>>' + JSON.stringify(txObj.payload.data.actions[0].payload.action.proposal_response_payload));
                    rwset = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset;
                    readSet = rwset.map(i => {
                        return {
                            'chaincode': i.namespace,
                            'set': i.rwset.reads
                        }
                    });
                    writeSet = rwset.map(i => {
                        return {
                            'chaincode': i.namespace,
                            'set': i.rwset.writes
                        }
                    });

                    chaincode_proposal_input = txObj.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args;

                    if (chaincode_proposal_input != undefined) {
                        let inputs = '';
                        for (let input of chaincode_proposal_input) {
                            inputs = (inputs === '' ? inputs : (inputs + ",")) + convertHex.bytesToHex(input);
                        }
                        chaincode_proposal_input = inputs;
                    }
                    endorser_signature = txObj.payload.data.actions[0].payload.action.endorsements[0].signature;

                    if (endorser_signature != undefined) {
                        endorser_signature = convertHex.bytesToHex(endorser_signature)
                    }

                    payload_proposal_hash = txObj.payload.data.actions[0].payload.action.proposal_response_payload.proposal_hash;
                    endorser_id_bytes = txObj.payload.data.actions[0].payload.action.endorsements[0].endorser.IdBytes;

                }

                let read_set = JSON.stringify(readSet, null, 2);
                let write_set = JSON.stringify(writeSet, null, 2);
                let chaincode_id = String.fromCharCode.apply(null, chaincodeID);

                if (header.channel_header.typeString === BLOCK_TYPE_ENDORSER_TRANSACTION && chaincode === CHAINCODE_LSCC) {
                    let channel = client.hfc_client.getChannel(channel_name);
                    await this.insertFromDiscoveryResults(client, channel, channel_genesis_hash);
                }


                var transaction_row = {
                    'blockid': block.header.number,
                    'txhash': txObj.payload.header.channel_header.tx_id,
                    'createdt': createdt,
                    'chaincodename': chaincode,
                    'chaincode_id': chaincode_id,
                    'status': status,
                    'creator_msp_id': txObj.payload.header.signature_header.creator.Mspid,
                    'endorser_msp_id': mspId,
                    'type': txObj.payload.header.channel_header.typeString,
                    'read_set': read_set,
                    'write_set': write_set,
                    'genesis_block_hash': channel_genesis_hash,
                    'validation_code': validation_code,
                    'envelope_signature': envelope_signature,
                    'payload_extension': payload_extension,
                    'creator_nonce': creator_nonce,
                    'chaincode_proposal_input': chaincode_proposal_input,
                    'endorser_signature': endorser_signature,
                    'creator_id_bytes': creator_id_bytes,
                    'payload_proposal_hash': payload_proposal_hash,
                    'endorser_id_bytes': endorser_id_bytes
                };
                let res = await this.persistence.getCrudService().saveTransaction(transaction_row);
            }
            let status = await this.persistence.getCrudService().saveBlock(block_row);
            if (status) {
                //push last block
                var notify = {
                    'title': 'Block ' + block.header.number + ' Added',
                    'type': 'block',
                    'message': 'Block ' + block.header.number + ' established with ' + block.data.data.length + ' tx',
                    'time': createdt,
                    'txcount': block.data.data.length,
                    'datahash': block.header.data_hash
                };

                this.broadcaster.broadcast(notify);
            }


        } else {
            console.log('Failed to process the block of channel ' + channel_name);
        }

    }

    async getGenesisBlock(client, channel) {

        let defaultOrderer = client.getDefaultOrderer();

        let request = {
            orderer: defaultOrderer,
            txId: client.getHFC_Client().newTransactionID(true) //get an admin based transactionID
        };

        let genesisBlock = await channel.getGenesisBlock(request);
        let block = BlockDecoder.decodeBlock(genesisBlock);

        return block;
    }

    async generateBlockHash(block_header) {
        let result = await fileUtil.generateBlockHash(block_header);
        return result;
    }

    async getBlockTimeStamp(dateStr) {
        try {
            return new Date(dateStr);
        } catch (err) {
            console.log(err)
        }

        return new Date(dateStr);
    };
    getCurrentChannel() {
        return
    }


    getPlatform() {
        return this.platform;
    }

    getPersistence() {
        return this.persistence;
    }

    getBroadcaster() {
        return this.broadcaster;
    }

}

module.exports = FabricServices;

function convertValidationCode(code) {
    if (typeof code === 'string') {
        return code;
    }
    return _validation_codes[code];
}