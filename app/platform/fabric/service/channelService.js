/*
    SPDX-License-Identifier: Apache-2.0
*/

const util = require('util');
const path = require('path');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const config = require('../../../platform/fabric/config.json');
const FabricUtils = require('./../utils/FabricUtils.js');
const helper = require('../../../common/helper');
const ExplorerError = require('../../../common/ExplorerError');

const { configtxgenToolPath } = config;

const logger = helper.getLogger('channelservice');

async function generateChannelArtifacts(artifacts) {
  const artifactsDir = await FabricUtils.generateDir();
  const artifactChannelPath = path.resolve(artifactsDir);
  const channelTxPath = `${artifactChannelPath}/${artifacts.channelName}.tx`;
  const channelBlockPath = `${artifactChannelPath}/${
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

  await Promise.all([
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
  const channelArtifacts = {
    channelTxPath,
    channelBlockPath
  };
  return channelArtifacts;
}

async function createChannel(artifacts, client) {
  try {
    if (
      artifacts &&
      artifacts.channelName &&
      artifacts.profile &&
      artifacts.genesisBlock
    ) {
      // generate genesis block and channel transaction             //
      const channelGenesis = await generateChannelArtifacts(artifacts);
      artifacts.channelTxPath = channelGenesis.channelTxPath;

      logger.info('############### C R E A T E  C H A N N E L ###############');
      logger.info(
        `Creating channel: ${artifacts.orgName}`,
        artifacts.orgConfigPath,
        artifacts.channelConfigPath
      );

      const envelope = fs.readFileSync(artifacts.channelTxPath);
      const channelConfig = client.extractChannelConfig(envelope);
      const signature = client.signChannelConfig(channelConfig);

      const request = {
        config: channelConfig,
        signatures: [signature],
        name: artifacts.channelName,
        txId: client.newTransactionID(true)
      };

      const response = await client.createChannel(request);

      if (response && response.status === 'SUCCESS') {
        artifacts.channelHash = response.txId;
        logger.info(
          'Successfully created the channel, txId %s',
          artifacts.channelHash
        );
        const resp = {
          success: true,
          message: `Successfully created channel ${artifacts.channelName}`
        };
        return resp;
      }
      logger.error(
        `Failed to create the channel  ${artifacts.channelName}`,
        response
      );
      const resp = {
        success: false,
        message: response.info
          ? response.info
          : `Failed to create the channel ${artifacts.channelName}`
      };
      return resp;
    }
    logger.debug('artifacts ', artifacts);
    const response = {
      success: false,
      message: 'Invalid request '
    };
    return response;
  } catch (err) {
    logger.error('createChannel ', err);
    const response = {
      success: false,
      message: 'Invalid request, payload'
    };
    return response;
  }
}

/*
 * Have an organization join a channel
 */
const joinChannel = async function(
  channel_name,
  peers,
  org_name,
  client,
  peers_config
) {
  logger.debug('\n\n============ Join Channel start ============\n');
  let error_message;
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
    const channel = client.getChannel(channel_name);
    if (!channel) {
      const message = util.format(
        'Channel %s was not defined in the connection profile',
        channel_name
      );
      logger.error(message);
      throw new ExplorerError(message);
    }
    peers.forEach(peer => {
      channel.addPeer(client.getPeer(peer), client.getMspid());
    });

    // next step is to get the genesis_block from the orderer,
    // the starting point for the channel that we want to join
    const request = {
      txId: client.newTransactionID(true) // get an admin based transactionID
    };
    const genesis_block = await channel.getGenesisBlock(request);
    const peersObj = [];

    for (const peer_name of peers) {
      const peer_config = peers_config[peer_name];
      const pem = FabricUtils.getPEMfromConfig(peer_config.tlsCACerts);
      const peer = client.newPeer(peer_config.url, {
        pem,
        'ssl-target-name-override':
          peer_config.grpcOptions['ssl-target-name-override'],
        name: peer_config.grpcOptions['ssl-target-name-override']
      });
      peersObj.push(peer);
    }

    // tell each peer to join and wait for the event hub of each peer to tell us
    // that the channel has been created on each peer
    const join_request = {
      targets: peersObj, // using the peer names which only is allowed when a connection profile is loaded
      txId: client.newTransactionID(true), // get an admin based transactionID
      block: genesis_block
    };
    const results = await channel.joinChannel(join_request);
    logger.info('joinChannel res !!!!!!!!!!!!!!!!!!!!!', results);

    // lets check the results of sending to the peers which is
    // last in the results array
    const peers_results = results;
    // then each peer results
    for (const i in peers_results) {
      const peer_result = peers_results[i];
      if (peer_result.response && peer_result.response.status === 200) {
        logger.info('Successfully joined peer to the channel %s', channel_name);
      } else {
        const message = util.format(
          'Failed to joined peer to the channel %s',
          channel_name
        );
        error_message = message;
        logger.error(message);
      }
    }
  } catch (error) {
    logger.error(
      `Failed to join channel due to error: ${error.stack}`
        ? error.stack
        : error
    );
    error_message = error.toString();
  }
  if (!error_message) {
    const message = util.format(
      'Successfully joined peers in organization %s to the channel:%s',
      org_name,
      channel_name
    );
    logger.info(message);
    // build a response to send back to the REST caller
    const response = {
      success: true,
      message
    };
    return response;
  }
  const message = util.format(
    'Failed to join all peers to channel. cause:%s',
    error_message
  );
  logger.error(message);
  const response = {
    success: true,
    message
  };
  return response;
};

exports.createChannel = createChannel;
exports.generateChannelArtifacts = generateChannelArtifacts;
exports.joinChannel = joinChannel;
