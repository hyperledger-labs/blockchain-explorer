var path = require("path");
var fs = require('fs-extra');
var FabricClient = require('./FabricClient.js');
var fileUtil = require('../../explorer/rest/logical/utils/fileUtils.js');
var helper = require("../../helper.js");
var logger = helper.getLogger("FabricUtils");

exports.explorer = {
  const: {
    NETWORK_CONFIGS: 'network-configs',
    PERSISTENCE: 'persistence',
    BLOCK_TYPE_CONFIG: 'CONFIG',
    BLOCK_TYPE_ENDORSER_TRANSACTION: 'ENDORSER_TRANSACTION',
    CHAINCODE_LSCC: 'lscc',
    NOTITY_TYPE_NEWCHANNEL: '1',
    NOTITY_TYPE_UPDATECHANNEL: '2',
    NOTITY_TYPE_CHAINCODE: '3',
    NOTITY_TYPE_BLOCK: '4'
  }
};


async function createFabricClient(client_configs, client_name) {

  // clone global.hfc.config configuration
  var global_hfc_config = JSON.parse(JSON.stringify(global.hfc.config));

  let client_config = global_hfc_config;
  client_config.client = client_configs.clients[client_name];
  client_config.version = client_configs.version;
  client_config.channels = client_configs.channels;
  client_config.organizations = client_configs.organizations;
  client_config.peers = client_configs.peers;
  client_config.orderers = client_configs.orderers;

  // validate client configuration
  logger.debug('Validating client [%s] configuration', client_name);
  let validation = validateClientConfig(client_config);

  if (validation) {
    // create new FabricClient
    let client = new FabricClient(client_name);
    // initialize fabric client
    logger.debug('************ Initializing fabric client for [%s]************', client_name);
    await client.initialize(client_config);
    return client;
  }
}


function validateClientConfig(client_config) {

  logger.debug("Client configuration >> %j ", client_config);
  let message = !client_config.version ? "Client network version is not defined in configuration" : "";
  if (message) {
    logger.error(message);
    return false;
  }
  message = !client_config.client ? "Client is not defined in configuration" :
    !client_config.client.organization ? "Client organization is not defined in configuration" :
      !client_config.client.channel ? "Client default channel is not defined in configuration " :
        !(client_config.client.credentialStore &&
          client_config.client.credentialStore.path) ? "Client credential store path is not defined in configuration " :
          !(client_config.client.credentialStore.cryptoStore &&
            client_config.client.credentialStore.cryptoStore.path) ? "Client crypto store path is not defined in configuration " : null;

  if (message) {
    logger.error(message);
    return false;
  }

  message = !client_config.channels ? "Channels is not defined in configuration" :
    !client_config.channels[client_config.client.channel] ? "Default channel [" + client_config.client.channel + "] is not defined in configuration" : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let channel_name in client_config.channels) {
    message = !(client_config.channels[channel_name].peers &&
      Object.keys(client_config.channels[channel_name].peers).length > 0) ? "Default peer is not defined for channel [" + channel_name + "] in configuration" :
      !client_config.peers ? "Peers is not defined in configuration" :
        !client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]] ? "Default channel peers [" + Object.keys(client_config.channels[channel_name].peers)[0] + "] is not defined in configuration" :
          !(client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].tlsCACerts &&
            client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].tlsCACerts.path) ? "TLS CA Certs path is not defined default peer [" + Object.keys(client_config.channels[channel_name].peers)[0] + "] in configuration" :
            !client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].url ? "URL is not defined default peer [" + Object.keys(client_config.channels[channel_name].peers)[0] + "] in configuration" :
              !client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].eventUrl ? "Event URL is not defined default peer [" + Object.keys(client_config.channels[channel_name].peers)[0] + "] in configuration" :
                !(client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].grpcOptions &&
                  client_config.peers[Object.keys(client_config.channels[channel_name].peers)[0]].grpcOptions["ssl-target-name-override"]) ? "Server hostname is not defined default peer [" + Object.keys(client_config.channels[channel_name].peers)[0] + "] in configuration" : null;

    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.organizations ? "Organizations is not defined in configuration" :
    !client_config.organizations[client_config.client.organization] ? "Client organization [" + client_config.client.organization + "] is not defined in configuration" :
      !(client_config.organizations[client_config.client.organization].signedCert &&
        client_config.organizations[client_config.client.organization].signedCert.path) ? "Client organization signed Cert path for [" + client_config.client.organization + "] is not defined in configuration" : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let org_name in client_config.organizations) {
    message = !client_config.organizations[org_name].mspid ? "Organization mspid for [" + org_name + "] is not defined in configuration" :
      !(client_config.organizations[org_name].adminPrivateKey &&
        client_config.organizations[org_name].adminPrivateKey.path) ? "Organization admin private key path for [" + org_name + "] is not defined in configuration" : null;

    if (message) {
      logger.error(message);
      return false;
    } message = !client_config.peers ? "Peers is not defined in configuration" :
      !(client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].tlsCACerts &&
        client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].tlsCACerts.path) ? "TLS CA Certs path is not defined default peer [" + Object.keys(client_config.channels[client_config.client.channel].peers)[0] + "] in configuration" :
        !client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].url ? "URL is not defined default peer [" + Object.keys(client_config.channels[client_config.client.channel].peers)[0] + "] in configuration" :
          !client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].eventUrl ? "Event URL is not defined default peer [" + Object.keys(client_config.channels[client_config.client.channel].peers)[0] + "] in configuration" :
            !(client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].grpcOptions &&
              client_config.peers[Object.keys(client_config.channels[client_config.client.channel].peers)[0]].grpcOptions["ssl-target-name-override"]) ? "Server hostname is not defined default peer [" + Object.keys(client_config.channels[client_config.client.channel].peers)[0] + "] in configuration" : null;

  }

  for (let peer_name in client_config.peers) {
    message = !client_config.peers[peer_name].url ? "Peer URL for [" + peer_name + "] is not defined in configuration" : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.orderers ? "Orderers is not defined in configuration" :
    !Object.keys(client_config.orderers).length ? "Default orderer is not defined in configuration" :
      !client_config.orderers[Object.keys(client_config.orderers)[0]].url ? "Default orderer URL is not defined in configuration" : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let ord_name in client_config.orderers) {
    message = !client_config.orderers[ord_name].url ? "Orderer URL for [" + ord_name + "] is not defined in configuration" : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }
  return true;
}

async function setAdminEnrolmentPath(network_configs) {

  for (let network_name in network_configs) {
    network_configs[network_name] = setOrgEnrolmentPath(network_configs[network_name]);
  }
  return network_configs;
}

function setOrgEnrolmentPath(network_config) {

  if (network_config && network_config.organizations) {

    for (let organization_name in network_config.organizations) {
      // checking files path is defined as full path or directory
      // if directory, then it will consider the first file
      let organization = network_config.organizations[organization_name];
      if (!organization.fullpath) {
        // setting admin private key as first file from keystore dir
        logger.debug('Organization [%s] enrolment files path defined as directory', organization_name);
        if (organization.adminPrivateKey) {
          let privateKeyPath = organization.adminPrivateKey.path;
          var files = fs.readdirSync(privateKeyPath);
          if (files && files.length > 0) {
            organization.adminPrivateKey.path = path.join(privateKeyPath, files[0]);
          }
        }
        // setting admin private key as first file from signcerts dir
        if (organization.signedCert) {
          let signedCertPath = organization.signedCert.path;
          var files = fs.readdirSync(signedCertPath);
          if (files && files.length > 0) {
            organization.signedCert.path = path.join(signedCertPath, files[0]);
          }
        }
      } else {
        logger.debug('Organization [%s] enrolment files path defined as full path', organization_name);
      }
    }
  }
  return network_config;
}

async function generateBlockHash(block_header) {
  let result = await fileUtil.generateBlockHash(block_header);
  return result;
}

async function getBlockTimeStamp(dateStr) {
  try {
    return new Date(dateStr);
  } catch (err) {
    console.log(err)
  }
  return new Date(dateStr);
};

exports.setAdminEnrolmentPath = setAdminEnrolmentPath;
exports.setOrgEnrolmentPath = setOrgEnrolmentPath;
exports.generateBlockHash = generateBlockHash;
exports.createFabricClient = createFabricClient;
exports.getBlockTimeStamp = getBlockTimeStamp;
