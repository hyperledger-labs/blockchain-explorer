/*
    SPDX-License-Identifier: Apache-2.0
*/

const Fabric_Client = require('fabric-client');
const helper = require('../../common/helper');

const logger = helper.getLogger('FabricClient');
const ExplorerError = require('../../common/ExplorerError');
const BlockDecoder = require('fabric-client/lib/BlockDecoder');
const AdminPeer = require('./AdminPeer');
const grpc = require('grpc');
const User = require('fabric-client/lib/User.js');
const client_utils = require('fabric-client/lib/client-utils.js');
const channelService = require('./service/channelService.js');
const FabricUtils = require('./utils/FabricUtils.js');
const explorer_config = require('../../explorerconfig.json');
const explorer_const = require('../../common/ExplorerConst.js').explorer.const;
const path = require('path');

const _commonProto = grpc.load(
  `${__dirname}/../../../node_modules/fabric-client/lib/protos/common/common.proto`
).common;
const Constants = require('fabric-client/lib/Constants.js');

const ROLES = Constants.NetworkConfig.ROLES;

const explorer_mess = require('../../common/ExplorerMessage').explorer;

class FabricClient {
  constructor(client_name) {
    this.client_name = client_name;
    this.hfc_client = new Fabric_Client();
    this.defaultPeer = {};
    this.defaultChannel = {};
    this.defaultOrderer = null;
    this.channelsGenHash = new Map();
    this.client_config;
    this.adminpeers = new Map();
    this.adminusers = new Map();
    this.peerroles = {};
    this.status = false;
    for (const role of ROLES) {
      this.peerroles[role] = role;
    }
  }

  async initialize(client_config, persistence) {
    // Loading configuration for fabric-ca if enabled.
    // It might be overriden by environment variables
    Fabric_Client.addConfigFile(path.join(__dirname, 'config_ca.json'));

    this.client_config = client_config;

    // Loading client from network configuration file
    logger.debug(
      'Loading client  [%s] from configuration ...',
      this.client_name
    );
    await this.LoadClientFromConfig(client_config);
    logger.debug(
      'Successfully loaded client [%s] from configuration',
      this.client_name
    );

    // enable discover
    await this.defaultChannel.initialize({
      discover: true,
      target: this.defaultPeer
    });

    let organization = client_config.client.organization;
    logger.debug(
      client_config.organizations[organization].certificateAuthorities
    );

    // Check if CA is configured or not
    if (
      client_config.organizations[organization].certificateAuthorities &&
      client_config.organizations[organization].certificateAuthorities.length
    ) {
      // CA configured
      logger.debug('CA configured in connection profile [%s]', organization);
      await this.getRegisteredUser(client_config);
    }

    // getting channels from queryChannels
    let channels;
    try {
      channels = await this.hfc_client.queryChannels(
        this.defaultPeer.getName(),
        true
      );
    } catch (e) {
      logger.error(e);
    }

    if (channels) {
      this.status = true;
      logger.debug('Client channels >> %j', channels.channels);

      // initialize channel network information from Discover
      for (const channel of channels.channels) {
        await this.initializeNewChannel(channel.channel_id);
        logger.debug('Initialized channel >> %s', channel.channel_id);
      }

      try {
        // load default channel network details from discovery
        const result = await this.defaultChannel.getDiscoveryResults();
      } catch (e) {
        logger.debug('Channel Discovery >>  %s', e);
        throw new ExplorerError(
          explorer_mess.error.ERROR_2001,
          this.defaultChannel.getName(),
          this.client_name
        );
      }
      // setting default orderer
      const channel_name = client_config.client.channel;
      const channel = await this.hfc_client.getChannel(channel_name);
      const temp_orderers = await channel.getOrderers();
      if (temp_orderers && temp_orderers.length > 0) {
        this.defaultOrderer = temp_orderers[0];
      } else {
        throw new ExplorerError(explorer_mess.error.ERROR_2002);
      }
      logger.debug(
        'Set client [%s] default orderer as  >> %s',
        this.client_name,
        this.defaultOrderer.getName()
      );
    } else if (persistence) {
      this.initializeDetachClient(client_config, persistence);
    }
  }

  async initializeDetachClient(client_config, persistence) {
    this.client_config = client_config;

    console.log(
      '\n**************************************************************************************'
    );
    console.log('Error :', explorer_mess.error.ERROR_1009);
    console.log('Info : ', explorer_mess.message.MESSAGE_1001);
    console.log(
      '**************************************************************************************\n'
    );
    const defaultClientId = Object.keys(
      client_config.channels[client_config.client.channel].peers
    )[0];
    const channels = await persistence
      .getCrudService()
      .getChannelsInfo(defaultClientId);

    const default_channel_name = client_config.client.channel;
    const default_peer_name = Object.keys(
      client_config.channels[default_channel_name].peers
    )[0];

    if (channels.length == 0) {
      throw new ExplorerError(explorer_mess.error.ERROR_2003);
    }

    for (const channel of channels) {
      this.setChannelGenHash(channel.channelname, channel.channel_genesis_hash);

      const nodes = await persistence
        .getMetricService()
        .getPeerList(channel.channel_genesis_hash);

      let newchannel;
      try {
        newchannel = this.hfc_client.getChannel(channel.channelname);
      } catch (e) {}
      if (newchannel === undefined) {
        newchannel = this.hfc_client.newChannel(channel.channelname);
      }

      for (const node of nodes) {
        const peer_config = this.client_config.peers[node.server_hostname];
        let pem;
        try {
          if (peer_config && peer_config.tlsCACerts) {
            pem = FabricUtils.getPEMfromConfig(peer_config.tlsCACerts);
            const msps = {
              [node.mspid]: {
                tls_root_certs: pem
              }
            };
            const adminpeer = await this.newAdminPeer(
              newchannel,
              node.requests,
              node.mspid,
              node.server_hostname,
              msps
            );
            if (adminpeer) {
              const username = `${this.client_name}_${node.mspid}Admin`;
              if (!this.adminusers.get(username)) {
                const user = await this.newUser(node.mspid, username);
                if (user) {
                  logger.debug(
                    'Successfully created user [%s] for client [%s]',
                    username,
                    this.client_name
                  );
                  this.adminusers.set(username, user);
                }
              }
            }
          }
        } catch (e) {}
      }
      try {
        newchannel.getPeer(default_peer_name);
      } catch (e) {
        const url = 'grpc://localhost:7051';
        const newpeer = this.hfc_client.newPeer(url, {
          'ssl-target-name-override': default_peer_name,
          name: default_peer_name
        });
        newchannel.addPeer(newpeer);
      }
    }

    this.defaultChannel = this.hfc_client.getChannel(default_channel_name);
    if (this.defaultChannel.getPeers().length > 0) {
      this.defaultPeer = this.defaultChannel.getPeer(default_peer_name);
    }

    if (this.defaultChannel === undefined) {
      throw new ExplorerError(explorer_mess.error.ERROR_2004);
    }
    if (this.defaultPeer === undefined) {
      throw new ExplorerError(explorer_mess.error.ERROR_2005);
    }
  }

  async getRegisteredUser(client_config) {
    try {
      var username = Fabric_Client.getConfigSetting(
        'enroll-id',
        'dflt_hlbeuser'
      );
      var userOrg = client_config.client.organization;
      var client = await this.LoadClientFromConfig(client_config);
      logger.debug('Successfully initialized the credential stores');
      // client can now act as an agent for the specified organization
      // first check to see if the user is already enrolled
      var user = await this.hfc_client.getUserContext(username, true);
      if (user && user.isEnrolled()) {
        logger.info(
          'Successfully loaded member from persistence [%s]',
          username
        );
      } else {
        // user was not enrolled, so we will need an admin user object to register
        logger.info(
          'User %s was not enrolled, so we will need an admin user object to register',
          username
        );

        let adminUserObj = await this.hfc_client.setUserContext({
          username: Fabric_Client.getConfigSetting('admin-username', 'admin'),
          password: Fabric_Client.getConfigSetting('admin-secret', 'adminpw')
        });
        let caClient = this.hfc_client.getCertificateAuthority();
        let secret = await caClient.register(
          {
            enrollmentID: username,
            affiliation:
              userOrg.toLowerCase() +
              Fabric_Client.getConfigSetting('enroll-affiliation', '')
          },
          adminUserObj
        );
        logger.debug('Successfully got the secret for user %s', username);
        user = await this.hfc_client.setUserContext({
          username: username,
          password: secret
        });
        logger.debug(
          'Successfully enrolled username %s  and setUserContext on the client object',
          username
        );
      }
      if (!user || !user.isEnrolled) {
        throw new Error('User was not enrolled ');
      }
    } catch (error) {
      logger.error(
        'Failed to get registered user: %s with error: %s',
        username,
        error.toString()
      );
      return 'failed ' + error.toString();
    }
  }

  async LoadClientFromConfig(client_config, username) {
    const _self = this;
    // load client through hfc client network configuration class
    await this.hfc_client.loadFromConfig(client_config);
    // initialize credential stores
    await this.hfc_client.initCredentialStores();
    logger.debug(
      'Successfully initialized credential stores for client [%s]',
      this.client_name
    );

    // Creating Admin User
    const organization = await this.hfc_client._network_config.getOrganization(
      client_config.client.organization,
      true
    );
    if (organization) {
      const mspid = organization.getMspid();
      const admin_key = organization.getAdminPrivateKey();
      const admin_cert = organization.getAdminCert();
      const username = `${this.client_name}_${mspid}Admin`;
      const user = await this.hfc_client.createUser({
        username,
        mspid,
        cryptoContent: {
          privateKeyPEM: admin_key,
          signedCertPEM: admin_cert
        },
        skipPersistence: false
      });
      logger.debug(
        'Successfully created admin user [%s] for client [%s]',
        username,
        this.client_name
      );
      this.adminusers.set(username, user);
    }

    // Loading default Peer and channel
    const channel_name = client_config.client.channel;
    this.defaultChannel = this.hfc_client.getChannel(channel_name);
    logger.debug(
      'Set client [%s] default channel as  >> %s',
      this.client_name,
      this.defaultChannel.getName()
    );

    var peers = this.defaultChannel.getPeers();
    this.defaultPeer = undefined;
    if (peers.length > 0) {
      for (const peer of peers) {
        // Select a peer as default peer from ones within the same organization
        if (peer.isInOrg(organization.getMspid())) {
          logger.debug('%s is in %s', peer.getName(), organization.getName());
          this.defaultPeer = this.defaultChannel.getPeer(peer.getName());
          break;
        }
      }
    }
    if (peers.length == 0 || this.defaultPeer == undefined) {
      throw new ExplorerError(explorer_mess.error.ERROR_2006, this.client_name);
    }
    logger.debug(
      'Set client [%s] default peer as  >> %s',
      this.client_name,
      this.defaultPeer.getName()
    );
  }

  async initializeNewChannel(channel_name) {
    // If the new channel is not defined in configuration, then use default channel configuration as new channel configuration
    if (!this.client_config.channels[channel_name]) {
      this.hfc_client._network_config._network_config.channels[
        channel_name
      ] = this.client_config.channels[this.defaultChannel.getName()];
    }
    // get channel, if the channel is not exist in the hfc client context,
    // then it will create new channel from the netwrok configuration
    const channel = this.hfc_client.getChannel(channel_name);
    await this.initializeChannelFromDiscover(channel_name);

    // get genesis block for the channel
    const block = await this.getGenesisBlock(channel);
    logger.debug(
      'Genesis Block for client [%s] >> %j',
      this.client_name,
      block
    );
    const channel_genesis_hash = await FabricUtils.generateBlockHash(
      block.header
    );
    // setting channel_genesis_hash to map
    this.setChannelGenHash(channel_name, channel_genesis_hash);

    logger.debug(
      'Channel genesis hash for channel [%s] >> %s',
      channel_name,
      channel_genesis_hash
    );
  }

  async initializeChannelFromDiscover(channel_name) {
    let channel = this.hfc_client.getChannel(channel_name, false);
    if (!channel) {
      await this.initializeNewChannel(channel_name);
      channel = this.getChannel(channel_name);
    }
    const discover_results = await this.getChannelDiscover(channel);
    logger.debug(
      'Discover results for client [%s] >> %j',
      this.client_name,
      discover_results
    );
    // creating users for admin peers
    if (discover_results) {
      if (discover_results.msps) {
        for (const msp_name in discover_results.msps) {
          const msp = discover_results.msps[msp_name];

          if (!channel._msp_manager.getMSP(msp.id)) {
            const config = {
              rootCerts: msp.rootCerts,
              intermediateCerts: msp.intermediateCerts,
              admins: msp.admins,
              cryptoSuite: channel._clientContext._crytoSuite,
              id: msp.id,
              orgs: msp.orgs,
              tls_root_certs: msp.tls_root_certs,
              tls_intermediate_certs: msp.tls_intermediate_certs
            };
            channel._msp_manager.addMSP(config);
          }

          const username = `${this.client_name}_${msp.id}Admin`;
          if (!this.adminusers.get(username)) {
            const user = await this.newUser(msp_name, username, msp.admins);
            if (user) {
              logger.debug(
                'Successfully created user [%s] for client [%s]',
                username,
                this.client_name
              );
              this.adminusers.set(username, user);
            }
          }
        }
      }
      // creating orderers
      if (discover_results.orderers) {
        for (const msp_id in discover_results.orderers) {
          const endpoints = discover_results.orderers[msp_id].endpoints;
          for (const endpoint of endpoints) {
            let requesturl = endpoint.host;
            if (
              this.client_config.orderers &&
              this.client_config.orderers[requesturl] &&
              this.client_config.orderers[requesturl].url
            ) {
              requesturl = this.client_config.orderers[requesturl].url;
              this.newOrderer(
                channel,
                requesturl,
                msp_id,
                endpoint.host,
                discover_results.msps
              );
              logger.debug(
                'Successfully created orderer [%s:%s] for client [%s]',
                endpoint.host,
                endpoint.port,
                this.client_name
              );
            }
          }
        }
      }
      // creating admin peers
      if (discover_results && discover_results.peers_by_org) {
        for (const org_name in discover_results.peers_by_org) {
          const org = discover_results.peers_by_org[org_name];
          for (const peer of org.peers) {
            const host = peer.endpoint.split(':')[0];
            if (
              this.client_config.peers &&
              this.client_config.peers[host] &&
              this.client_config.peers[host].url
            ) {
              const adminpeer = this.newAdminPeer(
                channel,
                this.client_config.peers[host].url,
                peer.mspid,
                host,
                discover_results.msps
              );
              logger.debug(
                'Successfully created peer [%s:%s] for client [%s]',
                host,
                peer.port,
                this.client_name
              );
            } else {
              logger.error(
                'Peer configuration is not found in config.json for peer %s and url %s , so peer status not work for the peer',
                host_port,
                requesturl
              );
              return;
            }
          }
        }
      }
      channel._discovery_results = discover_results;
      return discover_results;
    }
  }

  newAdminPeer(channel, url, msp_id, host, msps) {
    if (!url) {
      logger.debug('Client.newAdminPeer requesturl is required ');
      return;
    }

    if (!host) {
      logger.debug('Client.newAdminPeer host is required ');
      return;
    }

    if (!this.adminpeers.get(url)) {
      let newpeer = this.newPeer(channel, url, msp_id, host, msps);
      if (
        newpeer &&
        newpeer.constructor &&
        newpeer.constructor.name === 'ChannelPeer'
      ) {
        newpeer = newpeer.getPeer();
      }
      const adminpeer = new AdminPeer(msp_id, newpeer);
      logger.debug(
        'Successfully created Admin peer [%s] for client [%s]',
        url,
        this.client_name
      );
      this.adminpeers.set(url, adminpeer);
      return adminpeer;
    }
  }

  newOrderer(channel, url, msp_id, host, msps) {
    let newOrderer = null;
    channel._orderers.forEach(orderer => {
      if (orderer.getUrl() === url) {
        logger.debug('Found existing orderer %s', url);
        newOrderer = orderer;
      }
    });
    if (!newOrderer) {
      if (msps[msp_id]) {
        logger.debug('Create a new orderer %s', url);
        newOrderer = this.hfc_client.newOrderer(
          url,
          channel._buildOptions(url, url, host, msps[msp_id])
        );
        channel.addOrderer(newOrderer);
      } else {
        throw new ExplorerError(explorer_mess.error.ERROR_2007);
      }
    }
    return newOrderer;
  }

  newPeer(channel, url, msp_id, host, msps) {
    let newpeer = null;
    channel._channel_peers.forEach(peer => {
      if (peer.getUrl() === url) {
        logger.debug('Found existing peer %s', url);
        newpeer = peer;
      }
    });
    if (!newpeer) {
      if (msps[msp_id]) {
        logger.debug('Create a new peer %s', url);
        newpeer = this.hfc_client.newPeer(
          url,
          channel._buildOptions(url, url, host, msps[msp_id])
        );
        channel.addPeer(newpeer, msp_id);
      } else {
        throw new ExplorerError(explorer_mess.error.ERROR_2007);
      }
    }
    return newpeer;
  }

  async getPeerStatus(peer) {
    const channel = this.getDefaultChannel();
    const adminpeer = this.adminpeers.get(peer.requests);
    let status = {};
    if (adminpeer) {
      const username = `${this.client_name}_${peer.mspid}Admin`;
      const user = this.adminusers.get(username);
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
        const seekHeader = client_utils.buildHeader(
          signer,
          seekInfoHeader,
          txId.getNonce()
        );
        const seekPayload = new _commonProto.Payload();
        seekPayload.setHeader(seekHeader);
        const seekPayloadBytes = seekPayload.toBuffer();
        const sig = signer.sign(seekPayloadBytes);
        const signature = Buffer.from(sig);
        // building manually or will get protobuf errors on send
        const envelope = {
          signature,
          payload: seekPayloadBytes
        };
        try {
          status = await adminpeer.GetStatus(envelope);
        } catch (e) {
          logger.error(e);
        }
      }
    } else {
      logger.debug('Admin peer Not found for %s', peer.requests);
    }
    return status;
  }

  async getChannelDiscover(channel) {
    const discover_request = {
      target: this.defaultPeer.getName(),
      config: true
    };
    const discover_results = await channel._discover(discover_request);
    return discover_results;
  }

  async getGenesisBlock(channel) {
    const defaultOrderer = this.getDefaultOrderer();
    const request = {
      orderer: defaultOrderer,
      txId: this.getHFC_Client().newTransactionID(true) // get an admin based transactionID
    };
    const genesisBlock = await channel.getGenesisBlock(request);
    const block = BlockDecoder.decodeBlock(genesisBlock);
    return block;
  }

  async newUser(msp_name, username, msp_admin_cert) {
    const organization = await this.hfc_client._network_config.getOrganization(
      msp_name,
      true
    );
    if (!organization) {
      logger.debug('Client.createUser missing required organization.');
      return;
    }
    const mspid = organization.getMspid();
    if (!mspid || mspid.length < 1) {
      logger.debug('Client.createUser parameter mspid is required.');
      return;
    }
    const admin_key = organization.getAdminPrivateKey();
    let admin_cert = organization.getAdminCert();
    if (!admin_cert) {
      admin_cert = msp_admin_cert;
    }
    if (!admin_key) {
      logger.debug(
        'Client.createUser one of  cryptoContent privateKey, privateKeyPEM or privateKeyObj is required.'
      );
      return;
    }
    if (!admin_cert) {
      logger.debug(
        'Client.createUser either  cryptoContent signedCert or signedCertPEM is required.'
      );
      return;
    }

    const opts = {
      username,
      mspid,
      cryptoContent: {
        privateKeyPEM: admin_key,
        signedCertPEM: admin_cert
      }
    };
    let importedKey;
    const user = new User(opts.username);
    const privateKeyPEM = opts.cryptoContent.privateKeyPEM;
    if (privateKeyPEM) {
      logger.debug('then privateKeyPEM data');
      importedKey = await this.hfc_client
        .getCryptoSuite()
        .importKey(privateKeyPEM.toString(), {
          ephemeral: !this.hfc_client.getCryptoSuite()._cryptoKeyStore
        });
    }
    const signedCertPEM = opts.cryptoContent.signedCertPEM;
    logger.debug('then signedCertPEM data');
    user.setCryptoSuite(this.hfc_client.getCryptoSuite());
    await user.setEnrollment(importedKey, signedCertPEM.toString(), opts.mspid);
    logger.debug('then user');
    return user;
  }

  async createChannel(artifacts) {
    const respose = await channelService.createChannel(
      artifacts,
      this.hfc_client
    );
    return respose;
  }

  async joinChannel(channelName, peers, orgName) {
    const respose = await channelService.joinChannel(
      channelName,
      peers,
      orgName,
      this.hfc_client,
      this.client_config.peers
    );
    return respose;
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

  getClientName() {
    return this.client_name;
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

  getChannelByHash(channel_genesis_hash) {
    for (const [channel_name, hash_name] of this.channelsGenHash.entries()) {
      if (channel_genesis_hash === hash_name) {
        return this.hfc_client.getChannel(channel_name);
      }
    }
  }

  getChannel(channel_name) {
    return this.hfc_client.getChannel(channel_name);
  }

  setDefaultChannel(channel_name) {
    this.defaultChannel = this.hfc_client.getChannel(channel_name);
  }

  setDefaultChannelByHash(new_channel_genesis_hash) {
    for (const [
      channel_name,
      channel_genesis_hash
    ] of this.channelsGenHash.entries()) {
      if (new_channel_genesis_hash === channel_genesis_hash) {
        this.defaultChannel = this.hfc_client.getChannel(channel_name);
        return channel_genesis_hash;
      }
    }
  }

  setDefaultOrderer(defaultOrderer) {
    this.defaultOrderer = defaultOrderer;
  }

  getStatus() {
    return this.status;
  }
}

module.exports = FabricClient;
