/*
    SPDX-License-Identifier: Apache-2.0
*/

var Fabric_Client = require('fabric-client');
var helper = require("../../helper.js");
var logger = helper.getLogger("FabricClient");
var fs = require("fs-extra");
var Admin = require("./Admin.js");
var grpc = require('grpc');
const User = require('fabric-client/lib/User.js');
const client_utils = require('fabric-client/lib/client-utils.js');
const _commonProto = grpc.load(__dirname + '/../../../node_modules/fabric-client/lib/protos/common/common.proto').common;

class FabricClient {

    constructor(client_name, fabricServices) {
        this.client_name = client_name;
        this.hfc_client = new Fabric_Client();
        this.defaultPeer = {};
        this.defaultChannel = {};
        this.defaultOrderer = null;
        this.channelsGenHash = new Map();
        this.peerEventHub = {};
        this.channelEventHubs = new Map();
        this.fabricServices = fabricServices;
        this.client_config;
        this.adminpeers = new Map();
        this.adminusers = new Map();
    }

    async initialize(client_config) {

        this.client_config = client_config;

        //Loading client from network configuration file
        await this.LoadClientFromConfig(client_config);

        this.createPeerEventHub();

        // getting channels from queryChannels
        let channels = await this.hfc_client.queryChannels(this.defaultPeer.getName(), true);

        //console.log('Channels' + JSON.stringify(channels));

        // initialize channel network information from Discover
        for (let channel of channels.channels) {
            await this.initializeNewChannel(channel.channel_id);

        }

        try {
            let result = await this.defaultChannel.getDiscoveryResults();
        }
        catch (e) {
            console.log('Channel Discovery ' + e);
            throw new Error('Default defined channel ' + this.defaultChannel.getName() + ' not found for the client ' + this.client_name + ' peer');
        }

        let channel_name = client_config.client.channel;
        let channel = await this.hfc_client.getChannel(channel_name);
        let temp_orderers = await channel.getOrderers();

        if (temp_orderers && temp_orderers.length > 0) {
            this.defaultOrderer = temp_orderers[0];
        }
        else {
            throw new Error('There are no orderers defined on this channel in the network configuration');
        }
    }

    async LoadClientFromConfig(client_config) {

        //console.log('Started clientLoadFromConfig Method');

        var _self = this;
        await this.hfc_client.loadFromConfig(client_config);
        await this.hfc_client.initCredentialStores();

        // Creating Admin User
        let organization = await this.hfc_client._network_config.getOrganization(client_config.client.organization, true);
        if (organization) {
            let mspid = organization.getMspid();
            let admin_key = organization.getAdminPrivateKey();
            let admin_cert = organization.getAdminCert();
            let username = this.client_name + "_" + mspid + "Admin";
            let user = await this.hfc_client.createUser({
                username: username,
                mspid: mspid,
                cryptoContent: {
                    privateKeyPEM: admin_key,
                    signedCertPEM: admin_cert
                },
                skipPersistence: false
            });

            this.adminusers.set(username, user);
        }

        // Loading default Peer and channel
        let channel_name = client_config.client.channel;
        this.defaultChannel = this.hfc_client.getChannel(channel_name);

        if (this.defaultChannel.getPeers().length > 0) {
            this.defaultPeer = this.defaultChannel.getPeers()[0];
        } else {
            throw new Error('Default peer is not added to the client ' + this.client_name);
        }
        await this.initializeChannelFromDiscover(channel_name);

        //console.log('End clientLoadFromConfig Method');

    }

    async initializeChannelFromDiscover(channel_name) {

        let channel = this.hfc_client.getChannel(channel_name);
        const discover_request = {
            target: this.defaultPeer.getName(),
            config: true
        };
        let discover_results = await channel._discover(discover_request);

        if (discover_results) {
            if (discover_results.msps) {

                for (let msp_name in discover_results.msps) {

                    const msp = discover_results.msps[msp_name];
                    /*const config = {
                        rootCerts: msp.rootCerts,
                        intermediateCerts: msp.intermediateCerts,
                        admins: msp.admins,
                        cryptoSuite: channel._clientContext._crytoSuite,
                        id: msp.id,
                        orgs: msp.orgs,
                        tls_root_certs: msp.tls_root_certs,
                        tls_intermediate_certs: msp.tls_intermediate_certs
                    };
                    channel._msp_manager.addMSP(config);*/

                    let username = this.client_name + "_" + msp.id + "Admin";

                    if (!this.adminusers.get(username)) {
                        let organization = await this.hfc_client._network_config.getOrganization(msp_name, true);

                        if (organization) {

                            let mspid = organization.getMspid();
                            let admin_key = organization.getAdminPrivateKey();
                            let admin_cert = organization.getAdminCert();
                            if (!admin_cert) {
                                admin_cert = msp.admins;
                            }

                            let user = await this.createUser({
                                username: username,
                                mspid: mspid,
                                cryptoContent: {
                                    privateKeyPEM: admin_key,
                                    signedCertPEM: admin_cert
                                }
                            });

                            this.adminusers.set(username, user);
                        }
                    }

                }
            }

            if (discover_results.orderers) {
                for (let msp_id in discover_results.orderers) {
                    const endpoints = discover_results.orderers[msp_id].endpoints;
                    for (const endpoint of endpoints) {
                        let requesturl = endpoint.host + ":" + endpoint.port;
                        if (this.client_config.orderers && this.client_config.orderers[requesturl] && this.client_config.orderers[requesturl].url) {
                            requesturl = this.client_config.orderers[requesturl].url;
                            this.newOrderer(channel_name, requesturl, msp_id, endpoint.host, discover_results.msps);
                        }
                    }
                }
            }
            if (discover_results && discover_results.peers_by_org) {
                for (let org_name in discover_results.peers_by_org) {
                    let org = discover_results.peers_by_org[org_name];
                    for (var peer of org.peers) {
                        let requesturl = peer.endpoint;
                        requesturl = this.client_config.peers[requesturl].url;
                        if (!this.adminpeers.get(requesturl)) {
                            let host_port = peer.endpoint.split(':');
                            let pem = this.buildTlsRootCerts(discover_results.msps[org_name]);
                            let adminpeer = new Admin(requesturl, {
                                pem: pem,
                                "ssl-target-name-override": host_port[0]
                            });
                            this.adminpeers.set(requesturl, adminpeer);
                        }
                    }
                }
            }
            channel._discovery_results = discover_results;
            return discover_results;
        }
        return;
    }

    async createUser(opts) {
        logger.debug('opts = %j', opts);
        if (!opts) {
            throw new Error('Client.createUser missing required \'opts\' parameter.');
        }
        if (!opts.username || opts.username.length < 1) {
            throw new Error('Client.createUser parameter \'opts username\' is required.');
        }
        if (!opts.mspid || opts.mspid.length < 1) {
            throw new Error('Client.createUser parameter \'opts mspid\' is required.');
        }
        if (opts.cryptoContent) {
            if (!opts.cryptoContent.privateKey && !opts.cryptoContent.privateKeyPEM && !opts.cryptoContent.privateKeyObj) {
                throw new Error('Client.createUser one of \'opts cryptoContent privateKey, privateKeyPEM or privateKeyObj\' is required.');
            }
            if (!opts.cryptoContent.signedCert && !opts.cryptoContent.signedCertPEM) {
                throw new Error('Client.createUser either \'opts cryptoContent signedCert or signedCertPEM\' is required.');
            }
        } else {
            throw new Error('Client.createUser parameter \'opts cryptoContent\' is required.');
        }


        let importedKey;
        const user = new User(opts.username);
        let privateKeyPEM = opts.cryptoContent.privateKeyPEM;

        if (privateKeyPEM) {
            logger.debug('then privateKeyPEM data');
            importedKey = await this.hfc_client.getCryptoSuite().importKey(privateKeyPEM.toString(), { ephemeral: !this.hfc_client.getCryptoSuite()._cryptoKeyStore });
        }
        let signedCertPEM = opts.cryptoContent.signedCertPEM;

        logger.debug('then signedCertPEM data');

        user.setCryptoSuite(this.hfc_client.getCryptoSuite());
        await user.setEnrollment(importedKey, signedCertPEM.toString(), opts.mspid);

        logger.debug('then user');
        return user;


    }

    buildOptions(url, host, msp) {
        const method = '_buildOptions';
        logger.debug('%s - start', method);

        const caroots = this.buildTlsRootCerts(msp);
        const opts = {
            'pem': caroots,
            'ssl-target-name-override': host,
            'name': url
        };

        return opts;
    }

    buildTlsRootCerts(msp) {
        let caroots = '';
        if (msp.tls_root_certs) {
            caroots = caroots + msp.tls_root_certs;
        }
        if (msp.tls_intermediate_certs) {
            caroots = caroots + msp.tls_intermediate_certs;
        }

        return caroots;
    }

    createPeerEventHub() {

        // Creating EventHubs
        this.peerEventHub = this.hfc_client.getEventHub(this.defaultPeer.getName());

        this.peerEventHub.registerBlockEvent(
            (block) => {
                if (block.header.number === "0" || block.header.number == 0) {
                    this.fabricServices.processBlockEvent(this, block);
                }
            },
            (err) => {
                console.log('Block Event ' + err);
            }
        );
        //console.log('Start EventHub');
        this.connectPeerEventHub();

    }

    connectPeerEventHub() {
        //console.log('Start connectPeerEventHub Method');
        let _self = this;
        if (this.peerEventHub) {
            this.peerEventHub.connect();
            setTimeout(function () {
                _self.synchBlocks();
            }, 5000);
        } else {
            this.createPeerEventHub();
            return false;
        }
        //console.log('End connectPeerEventHub Method');
    }

    isPeerEventHubConnected() {
        if (this.peerEventHub) {
            return this.peerEventHub.isconnected();
        } else {
            return false;
        }
    }

    createChannelEventHub(channel) {

        let eventHub = channel.newChannelEventHub(this.defaultPeer);
        eventHub.registerBlockEvent(
            (block) => {
                // console.log('Process New Block  >>>>>>>' + JSON.stringify(block));
                if (!(block.header.number === "0" || block.header.number == 0)) {
                    this.fabricServices.processBlockEvent(this, block);
                }
            },
            (err) => {
                console.log('Block Event ' + err);
            }
        );

        this.connectChannelEventHub(channel.getName(), eventHub);
        this.channelEventHubs.set(channel.getName(), eventHub);

    }

    connectChannelEventHub(channel_name, eventHub) {
        //console.log('Start connectEventHub Method');
        let _self = this;
        if (eventHub) {
            eventHub.connect(true);
            setTimeout(function (channel_name) {
                _self.synchChannelBlocks(channel_name);
            }, 5000, channel_name);
        } else {
            let channel = this.hfc_client.getChannel(channel_name);
            this.createChannelEventHub(channel);
            return false;
        }
        //console.log('End connectEventHub Method');
    }

    isChannelEventHubConnected(channel_name) {
        let eventHub = this.channelEventHubs.get(channel_name);
        if (eventHub) {
            return eventHub.isconnected();
        } else {
            return false;
        }
    }

    disconnectChannelEventHub(channel_name) {
        let eventHub = this.channelEventHubs.get(channel_name);
        return eventHub.disconnec();
    }

    disconnectEventHubs() {
        for (var [channel_name, eventHub] of this.channelEventHubs.entries()) {
            let status = this.isChannelEventHubConnected();
            if (status) {
                this.disconnectChannelEventHub(channel_name);
            }
        }
        if (this.peerEventHub) {
            this.peerEventHub.disconnec();
        }
    }

    async synchChannelBlocks(channel_name) {
        //console.log('Start synchBlocks Method');
        if (this.isChannelEventHubConnected(channel_name)) {
            this.fabricServices.synchBlocks(this.client_name, channel_name);
        }
        //console.log('End synchBlocks Method');
    }

    async synchBlocks() {
        //console.log('Start synchBlocks Method');

        if (!this.isPeerEventHubConnected()) {
            this.connectPeerEventHub();
        }

        let channels = await this.getHFC_Client().queryChannels(this.getDefaultPeer().getName(), true);

        for (let channel of channels.channels) {
            let channel_name = channel.channel_id;
            if (!this.getChannels().get(channel_name)) {
                await this.initializeNewChannel(channel_name);
                //console.log('Fabric Client : Initialize New Channel >>> ' + JSON.stringify(channel_name));
            }
        }
        //console.log('Synch Blocks >>> ' + JSON.stringify(channels));

        for (let channel of channels.channels) {
            let channel_name = channel.channel_id;
            if (this.isChannelEventHubConnected(channel_name)) {
                this.fabricServices.synchBlocks(this.client_name, channel_name);
            } else {
                let eventHub = this.channelEventHubs.get(channel_name);
                if (eventHub) {
                    this.connectChannelEventHub(channel_name, eventHub)
                } else {
                    let channel = getChannels().get(channel_name);
                    if (channel) {
                        this.createChannelEventHub(channel);
                    } else {
                        await this.initializeNewChannel(this, channel_name);
                    }
                }
            }
        }
        console.log('End synchBlocks Method');
    }


    async initializeNewChannel(channel_name) {

        if (!this.client_config.channels[channel_name]) {
            this.client_config.channels[channel_name] = this.client_config.channels[this.defaultChannel.getName()];
        }
        let channel = this.hfc_client.getChannel(channel_name);

        await this.initializeChannelFromDiscover(channel_name);


        let block = await this.fabricServices.getGenesisBlock(this, channel);
        let channel_genesis_hash = await this.fabricServices.generateBlockHash(block.header);
        this.setChannelGenHash(channel_name, channel_genesis_hash);

        this.createChannelEventHub(channel);

        // inserting new channel details to DB
        await this.fabricServices.insertNewChannel(this, channel, block, channel_genesis_hash);
        await this.fabricServices.insertFromDiscoveryResults(this, channel, channel_genesis_hash);

    }



    newOrderer(channel_name, url, msp_id, host, msps) {
        const method = 'newOrderer';
        logger.debug('%s - start', method);

        let channel = this.hfc_client.getChannel(channel_name);

        let newOrderer = null;
        channel._orderers.forEach((orderer) => {
            if (orderer.getUrl() === url) {
                logger.debug('%s - found existing orderer %s', method, url);
                newOrderer = orderer;
            }
        });
        if (!newOrderer) {
            if (msps[msp_id]) {
                logger.debug('%s - create a new orderer %s', method, url);
                newOrderer = this.hfc_client.newOrderer(url, channel._buildOptions(url, url, host, msps[msp_id]));
                channel.addOrderer(newOrderer, true);
            } else {
                throw new Error('No TLS cert information available');
            }
        }
        logger.debug('%s - end', method);
        return newOrderer;
    }

    async getPeerStatus(peer) {

        let adminpeer = this.adminpeers.get(peer.requests);
        let status = {};
        if (adminpeer) {

            let channel = this.getDefaultChannel();

            let username = this.client_name + "_" + peer.mspid + "Admin";

            let user = this.adminusers.get(username);

            if (user) {

                const signer = user.getSigningIdentity(true);
                const txId = this.hfc_client.newTransactionID(true);

                // build the header for use with the seekInfo payload
                const seekInfoHeader = client_utils.buildChannelHeader(
                    _commonProto.HeaderType.PEER_ADMIN_OPERATION,
                    channel._name,
                    txId.getTransactionID(),
                    channel._initial_epoch,
                    null,
                    client_utils.buildCurrentTimestamp(),
                    channel._clientContext.getClientCertHash()
                );

                const seekHeader = client_utils.buildHeader(signer, seekInfoHeader, txId.getNonce());
                const seekPayload = new _commonProto.Payload();
                seekPayload.setHeader(seekHeader);
                const seekPayloadBytes = seekPayload.toBuffer();

                const sig = signer.sign(seekPayloadBytes);
                const signature = Buffer.from(sig);

                // building manually or will get protobuf errors on send
                const envelope = {
                    signature: signature,
                    payload: seekPayloadBytes
                };

                status = await adminpeer.GetStatus(envelope);

            }
        } else {
            console.log("Admin peer Not found");
        }
        return status;
    }

    getChannelNames() {
        return Array.from(this.channelsGenHash.keys());
    }

    getHFC_Client() {
        return this.hfc_client;
    }

    getChannels() {
        return this.hfc_client._channels; // return Map
    }

    getChannelGenHash(channel_name) {
        return this.channelsGenHash.get(channel_name);
    }

    setChannelGenHash(name, channel_genesis_hash) {
        this.channelsGenHash.set(name, channel_genesis_hash);
    }

    getDefaultPeer() {
        return this.defaultPeer;
    }

    getDefaultChannel() {
        return this.defaultChannel;
    }

    getDefaultOrderer() {
        return this.defaultOrderer;
    }

    setDefaultPeer(defaultPeer) {
        this.defaultPeer = defaultPeer;
    }

    setDefaultChannel(new_channel_genesis_hash) {

        for (var [channel_name, channel_genesis_hash] of this.channelsGenHash.entries()) {

            if (new_channel_genesis_hash === channel_genesis_hash) {
                // console.log('Default Channel >>>>>> [channel_name:' + channel_name + ",channel_genesis_hash:" + channel_genesis_hash + "]");
                this.defaultChannel = this.hfc_client.getChannel(channel_name);
                return channel_genesis_hash;
            }
        }
    }

    setDefaultOrderer(defaultOrderer) {
        this.defaultOrderer = defaultOrderer;
    }

}

module.exports = FabricClient;