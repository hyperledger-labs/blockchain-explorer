var path = require('path');
var fs = require('fs-extra');
var sha = require('js-sha256');
var asn = require('asn1.js');
var utils = require('fabric-client/lib/utils');
var FabricClient = require('./../FabricClient.js');
var helper = require('../../../common/helper');
var logger = helper.getLogger('FabricUtils');
var ExplorerError = require('../../../common/ExplorerError');

var explorer_error = require('../../../common/ExplorerMessage').explorer.error;

async function createFabricClient(client_configs, client_name, persistence) {
  // clone global.hfc.config configuration
  let client_config = cloneConfig(client_configs, client_name);

  // validate client configuration
  logger.debug('Validating client [%s] configuration', client_name);
  let validation = validateClientConfig(client_config);

  if (validation) {
    // create new FabricClient
    let client = new FabricClient(client_name);
    // initialize fabric client
    logger.debug(
      '************ Initializing fabric client for [%s]************',
      client_name
    );
    await client.initialize(client_config, persistence);
    return client;
  } else {
    throw new ExplorerError(explorer_error.ERROR_2014);
  }
}

async function createDetachClient(client_configs, client_name, persistence) {
  // clone global.hfc.config configuration
  let client_config = cloneConfig(client_configs, client_name);

  let client = new FabricClient(client_name);
  await client.initializeDetachClient(client_config, persistence);
  return client;
}

function cloneConfig(client_configs, client_name) {
  var global_hfc_config = JSON.parse(JSON.stringify(global.hfc.config));

  let client_config = global_hfc_config;
  client_config.client = client_configs.clients[client_name];
  client_config.version = client_configs.version;
  client_config.channels = client_configs.channels;
  client_config.organizations = client_configs.organizations;
  client_config.peers = client_configs.peers;
  client_config.orderers = client_configs.orderers;

  // modify url with respect to TLS enable
  client_config = processTLS_URL(client_config);
  return client_config;
}

function processTLS_URL(client_config) {
  for (let peer_name in client_config.peers) {
    let url = client_config.peers[peer_name].url;
    client_config.peers[peer_name].url = client_config.client.tlsEnable
      ? 'grpcs' + url.substring(url.indexOf('://'))
      : 'grpc' + url.substring(url.indexOf('://'));
    if (client_config.peers[peer_name].eventUrl) {
      let eventUrl = client_config.peers[peer_name].eventUrl;
      client_config.peers[peer_name].eventUrl = client_config.client.tlsEnable
        ? 'grpcs' + eventUrl.substring(eventUrl.indexOf('://'))
        : 'grpc' + eventUrl.substring(eventUrl.indexOf('://'));
    }
  }
  for (let ord_name in client_config.orderers) {
    let url = client_config.orderers[ord_name].url;
    client_config.orderers[ord_name].url = client_config.client.tlsEnable
      ? 'grpcs' + url.substring(url.indexOf('://'))
      : 'grpc' + url.substring(url.indexOf('://'));
  }
  return client_config;
}

function validateClientConfig(client_config) {
  logger.debug('Client configuration >> %j ', client_config);
  let message = !client_config.version
    ? 'Client network version is not defined in configuration'
    : null;
  if (message) {
    logger.error(message);
    return false;
  }
  message = !client_config.client
    ? 'Client is not defined in configuration'
    : !client_config.client.organization
      ? 'Client organization is not defined in configuration'
      : !client_config.client.channel
        ? 'Client default channel is not defined in configuration '
        : !(
            client_config.client.credentialStore &&
            client_config.client.credentialStore.path
          )
          ? 'Client credential store path is not defined in configuration '
          : !(
              client_config.client.credentialStore.cryptoStore &&
              client_config.client.credentialStore.cryptoStore.path
            )
            ? 'Client crypto store path is not defined in configuration '
            : null;

  if (message) {
    logger.error(message);
    return false;
  }

  message = !client_config.channels
    ? 'Channels is not defined in configuration'
    : !client_config.channels[client_config.client.channel]
      ? 'Default channel [' +
        client_config.client.channel +
        '] is not defined in configuration'
      : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let channel_name in client_config.channels) {
    message = !(
      client_config.channels[channel_name].peers &&
      Object.keys(client_config.channels[channel_name].peers).length > 0
    )
      ? 'Default peer is not defined for channel [' +
        channel_name +
        '] in configuration'
      : !client_config.peers
        ? 'Peers is not defined in configuration'
        : !client_config.peers[
            Object.keys(client_config.channels[channel_name].peers)[0]
          ]
          ? 'Default channel peers [' +
            Object.keys(client_config.channels[channel_name].peers)[0] +
            '] is not defined in configuration'
          : !(
              !client_config.client.tlsEnable ||
              (client_config.peers[
                Object.keys(client_config.channels[channel_name].peers)[0]
              ].tlsCACerts &&
                client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].tlsCACerts.path)
            )
            ? 'TLS CA Certs path is not defined default peer [' +
              Object.keys(client_config.channels[channel_name].peers)[0] +
              '] in configuration'
            : !client_config.peers[
                Object.keys(client_config.channels[channel_name].peers)[0]
              ].url
              ? 'URL is not defined default peer [' +
                Object.keys(client_config.channels[channel_name].peers)[0] +
                '] in configuration'
              : !client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].eventUrl
                ? 'Event URL is not defined default peer [' +
                  Object.keys(client_config.channels[channel_name].peers)[0] +
                  '] in configuration'
                : !(
                    client_config.peers[
                      Object.keys(client_config.channels[channel_name].peers)[0]
                    ].grpcOptions &&
                    client_config.peers[
                      Object.keys(client_config.channels[channel_name].peers)[0]
                    ].grpcOptions['ssl-target-name-override']
                  )
                  ? 'Server hostname is not defined default peer [' +
                    Object.keys(client_config.channels[channel_name].peers)[0] +
                    '] in configuration'
                  : null;

    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.organizations
    ? 'Organizations is not defined in configuration'
    : !client_config.organizations[client_config.client.organization]
      ? 'Client organization [' +
        client_config.client.organization +
        '] is not defined in configuration'
      : !(
          client_config.organizations[client_config.client.organization]
            .signedCert &&
          client_config.organizations[client_config.client.organization]
            .signedCert.path
        )
        ? 'Client organization signed Cert path for [' +
          client_config.client.organization +
          '] is not defined in configuration'
        : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let org_name in client_config.organizations) {
    message = !client_config.organizations[org_name].mspid
      ? 'Organization mspid for [' +
        org_name +
        '] is not defined in configuration'
      : !(
          client_config.organizations[org_name].adminPrivateKey &&
          client_config.organizations[org_name].adminPrivateKey.path
        )
        ? 'Organization admin private key path for [' +
          org_name +
          '] is not defined in configuration'
        : null;

    if (message) {
      logger.error(message);
      return false;
    }
    message = !client_config.peers
      ? 'Peers is not defined in configuration'
      : !(
          !client_config.client.tlsEnable ||
          (client_config.peers[
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0]
          ].tlsCACerts &&
            client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].tlsCACerts.path)
        )
        ? 'TLS CA Certs path is not defined default peer [' +
          Object.keys(
            client_config.channels[client_config.client.channel].peers
          )[0] +
          '] in configuration'
        : !client_config.peers[
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0]
          ].url
          ? 'URL is not defined default peer [' +
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0] +
            '] in configuration'
          : !client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].eventUrl
            ? 'Event URL is not defined default peer [' +
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0] +
              '] in configuration'
            : !(
                client_config.peers[
                  Object.keys(
                    client_config.channels[client_config.client.channel].peers
                  )[0]
                ].grpcOptions &&
                client_config.peers[
                  Object.keys(
                    client_config.channels[client_config.client.channel].peers
                  )[0]
                ].grpcOptions['ssl-target-name-override']
              )
              ? 'Server hostname is not defined default peer [' +
                Object.keys(
                  client_config.channels[client_config.client.channel].peers
                )[0] +
                '] in configuration'
              : null;
  }

  for (let peer_name in client_config.peers) {
    message = !client_config.peers[peer_name].url
      ? 'Peer URL for [' + peer_name + '] is not defined in configuration'
      : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.orderers
    ? 'Orderers is not defined in configuration'
    : !Object.keys(client_config.orderers).length
      ? 'Default orderer is not defined in configuration'
      : !client_config.orderers[Object.keys(client_config.orderers)[0]].url
        ? 'Default orderer URL is not defined in configuration'
        : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (let ord_name in client_config.orderers) {
    message = !client_config.orderers[ord_name].url
      ? 'Orderer URL for [' + ord_name + '] is not defined in configuration'
      : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }
  return true;
}

async function setAdminEnrolmentPath(network_configs) {
  for (let network_name in network_configs) {
    network_configs[network_name] = setOrgEnrolmentPath(
      network_configs[network_name]
    );
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
        logger.debug(
          'Organization [%s] enrolment files path defined as directory',
          organization_name
        );
        if (organization.adminPrivateKey) {
          let privateKeyPath = organization.adminPrivateKey.path;
          var files = fs.readdirSync(privateKeyPath);
          if (files && files.length > 0) {
            organization.adminPrivateKey.path = path.join(
              privateKeyPath,
              files[0]
            );
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
        logger.debug(
          'Organization [%s] enrolment files path defined as full path',
          organization_name
        );
      }
    }
  }
  return network_config;
}

async function generateBlockHash(block_header) {
  let result = await generateBlockHash(block_header);
  return result;
}

async function getBlockTimeStamp(dateStr) {
  try {
    return new Date(dateStr);
  } catch (err) {
    logger.error(err);
  }
  return new Date(dateStr);
}

async function generateDir() {
  var tempDir = '/tmp/' + new Date().getTime();
  try {
    fs.mkdirSync(tempDir);
  } catch (err) {
    logger.error(err);
  }
  return tempDir;
}

async function generateBlockHash(header) {
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
  return sha.sha256(output);
}

function getPEMfromConfig(config) {
  let result = null;
  if (config) {
    if (config['path']) {
      // cert value is in a file
      result = readFileSync(config['path']);
      result = utils.normalizeX509(result);
    }
  }

  return result;
}

function readFileSync(config_path) {
  try {
    let config_loc = path.resolve(config_path);
    let data = fs.readFileSync(config_loc);
    return Buffer.from(data).toString();
  } catch (err) {
    logger.error('NetworkConfig101 - problem reading the PEM file :: ' + err);
    throw err;
  }
}

exports.setAdminEnrolmentPath = setAdminEnrolmentPath;
exports.setOrgEnrolmentPath = setOrgEnrolmentPath;
exports.generateBlockHash = generateBlockHash;
exports.createFabricClient = createFabricClient;
exports.getBlockTimeStamp = getBlockTimeStamp;
exports.generateDir = generateDir;
exports.generateBlockHash = generateBlockHash;
exports.getPEMfromConfig = getPEMfromConfig;
exports.createDetachClient = createDetachClient;
