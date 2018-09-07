/*
    SPDX-License-Identifier: Apache-2.0
*/

const util = require('util');
var path = require('path');
var fs = require('fs');
const exec = util.promisify(require('child_process').exec);
var config = require('../../../platform/fabric/config.json');
var FabricUtils = require('./../utils/FabricUtils.js');
var helper = require('../../../common/helper');
var ExplorerError = require('../../../common/ExplorerError');
var configtxgenToolPath = config.configtxgenToolPath;
//var orgPath = path.join(__dirname, '../artifacts/channel/org1.yaml');
//var networkCfgPath = path.join(__dirname, '../artifacts/channel/network-config-tls.yaml');

var logger = helper.getLogger('channelservice');

var generateChannelArtifacts = async function(artifacts) {
  let artifactsDir = await FabricUtils.generateDir();
  var artifactChannelPath = path.resolve(artifactsDir);
  let channelTxPath = `${artifactChannelPath}/${artifacts.channelName}.tx`;
  let channelBlockPath = `${artifactChannelPath}/${
    artifacts.channelName
  }.block`;
  logger.info(
    ` ${configtxgenToolPath}/configtxgen -profile ${
      artifacts.profile
    } -outputCreateChannelTx ${channelTxPath} -channelID ${
      artifacts.channelName
    } `
  );
  logger.info(
    ` ${configtxgenToolPath}/configtxgen -profile ${
      artifacts.genesisBlock
    } -outputBlock ${channelBlockPath} `
  );

  const [status] = await Promise.all([
    exec(
      ` ${configtxgenToolPath}/configtxgen -profile ${
        artifacts.profile
      } -outputCreateChannelTx ${channelTxPath} -channelID ${
        artifacts.channelName
      } `
    ),
    exec(
      ` ${configtxgenToolPath}/configtxgen -profile ${
        artifacts.genesisBlock
      } -outputBlock ${channelBlockPath} `
    )
  ]).catch(error => {
    logger.error(error);
    throw new Error(error);
  });
  let channelArtifacts = {
    channelTxPath: channelTxPath,
    channelBlockPath: channelBlockPath
  };
  return channelArtifacts;
};

async function createChannel(artifacts, client) {
  try {
    if (
      artifacts &&
      artifacts.channelName &&
      artifacts.profile &&
      artifacts.genesisBlock
    ) {
      // generate genesis block and channel transaction             //
      let channelGenesis = await generateChannelArtifacts(artifacts);
      artifacts.channelTxPath = channelGenesis.channelTxPath;

      logger.info('############### C R E A T E  C H A N N E L ###############');
      logger.info(
        'Creating channel: ' + artifacts.orgName,
        artifacts.orgConfigPath,
        artifacts.channelConfigPath
      );

      var envelope = fs.readFileSync(artifacts.channelTxPath);
      var channelConfig = client.extractChannelConfig(envelope);
      let signature = client.signChannelConfig(channelConfig);

      let request = {
        config: channelConfig,
        signatures: [signature],
        name: artifacts.channelName,
        txId: client.newTransactionID(true)
      };

      var response = await client.createChannel(request);

      if (response && response.status === 'SUCCESS') {
        artifacts.channelHash = response.txId;
        logger.info(
          'Successfully created the channel, txId %s',
          artifacts.channelHash
        );
        let resp = {
          success: true,
          message: 'Successfully created channel ' + artifacts.channelName
        };
        return resp;
      } else {
        logger.error(
          'Failed to create the channel ' + artifacts.channelName,
          response
        );
        let resp = {
          success: false,
          message: response.info
            ? response.info
            : 'Failed to create the channel ' + artifacts.channelName
        };
        return resp;
      }
    } else {
      logger.debug('artifacts ', artifacts);
      let response = {
        success: false,
        message: 'Invalid request '
      };
      return response;
    }
  } catch (err) {
    logger.error('createChannel ', err);
    let response = {
      success: false,
      message: 'Invalid request, payload'
    };
    return response;
  }
}

/*
 * Have an organization join a channel
 */
var joinChannel = async function(
  channel_name,
  peers,
  org_name,
  client,
  peers_config
) {
  logger.debug('\n\n============ Join Channel start ============\n');
  var error_message;
  try {
    logger.info(
      'Calling peers in organization %s to join the channel',
      org_name
    );
    // first setup the client for this org
    logger.debug(
      'Successfully got the fabric client for the organization %s',
      org_name
    );
    var channel = client.getChannel(channel_name);
    if (!channel) {
      let message = util.format(
        'Channel %s was not defined in the connection profile',
        channel_name
      );
      logger.error(message);
      throw new ExplorerError(message);
    }

    // next step is to get the genesis_block from the orderer,
    // the starting point for the channel that we want to join
    let request = {
      txId: client.newTransactionID(true) //get an admin based transactionID
    };
    let genesis_block = await channel.getGenesisBlock(request);
    let peersObj = [];

    for (let peer_name of peers) {
      let peer_config = peers_config[peer_name];
      let pem = FabricUtils.getPEMfromConfig(peer_config.tlsCACerts);
      let peer = this.hfc_client.newPeer(peer_config.url, {
        pem: pem,
        'ssl-target-name-override':
          peer_config.grpcOptions['ssl-target-name-override'],
        name: peer_config.grpcOptions['ssl-target-name-override']
      });
      peersObj.push(peer);
    }

    // tell each peer to join and wait for the event hub of each peer to tell us
    // that the channel has been created on each peer
    let join_request = {
      targets: peersObj, //using the peer names which only is allowed when a connection profile is loaded
      txId: client.newTransactionID(true), //get an admin based transactionID
      block: genesis_block
    };
    let results = await channel.joinChannel(join_request);

    // lets check the results of sending to the peers which is
    // last in the results array
    let peers_results = results.pop();
    // then each peer results
    for (let i in peers_results) {
      let peer_result = peers_results[i];
      if (peer_result.response && peer_result.response.status == 200) {
        logger.info('Successfully joined peer to the channel %s', channel_name);
      } else {
        let message = util.format(
          'Failed to joined peer to the channel %s',
          channel_name
        );
        error_message = message;
        logger.error(message);
      }
    }
  } catch (error) {
    logger.error(
      'Failed to join channel due to error: ' + error.stack
        ? error.stack
        : error
    );
    error_message = error.toString();
  }
  if (!error_message) {
    let message = util.format(
      'Successfully joined peers in organization %s to the channel:%s',
      org_name,
      channel_name
    );
    logger.info(message);
    // build a response to send back to the REST caller
    let response = {
      success: true,
      message: message
    };
    return response;
  } else {
    let message = util.format(
      'Failed to join all peers to channel. cause:%s',
      error_message
    );
    logger.error(message);
    let response = {
      success: true,
      message: message
    };
    return response;
  }
};

exports.createChannel = createChannel;
exports.generateChannelArtifacts = generateChannelArtifacts;
exports.joinChannel = joinChannel;
