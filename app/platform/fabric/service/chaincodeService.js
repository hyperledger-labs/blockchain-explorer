/* eslint-disable guard-for-in; no-param-reassign */
/*
 *SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const path = require('path');
const util = require('util');
const helper = require('../../../common/helper');

const logger = helper.getLogger('chaincodeService');

const regXjs = '[a-z,A-Z,0-9]*.js$';
const regXgo = '[a-z,A-Z,0-9]*.go$';
let location;

const errors = {
  lnf: 'Location not found',
  erf: 'Error reading file'
};

function extractChaincodeZipArchive(fileContent, folderName) {
  const zip = new AdmZip(fileContent.data);
  zip.extractAllTo(folderName, true);
}

async function loadChaincodeSrc(_path) {
  if (_path.substring(0, 10) === 'github.com') {
    _path = _path.slice(10);
  }

  try {
    // try to get go chaincodes
    location = (await fs.readdir(path.join(process.env.GOPATH, 'src', _path)))
      .filter(ccPath => new RegExp(regXgo).test(ccPath))
      .map(ccPath => path.join(process.env.GOPATH, 'src', _path, ccPath));
  } catch (error) {
    location = errors.lnf;
  }

  if (location === errors.lnf) {
    try {
      location = (await fs.readdir(_path))
        .filter(ccPath => new RegExp(regXjs).test(ccPath))
        .map(ccPath => path.join(_path, ccPath));
    } catch (error) {
      location = errors.lnf;
    }
  }

  if (location === errors.lnf) {
    return errors.lnf;
  }
  let ccSource;
  let chaincodePath;

  try {
    if (Array.isArray(location) && location[0]) {
      // get the first path
      [chaincodePath] = location;
    } else {
      chaincodePath = location.split('\n');
    }
    if (Array.isArray(chaincodePath) && chaincodePath[0]) {
      [chaincodePath] = chaincodePath;
      chaincodePath = chaincodePath.trim();
    }
  } catch (error) {
    return errors.lnf;
  }
  try {
    ccSource = await fs.readFile(chaincodePath);
  } catch (error) {
    return errors.erf;
  }
  ccSource = ccSource.toString();
  return ccSource;
}
async function installChaincode(peer, name, zip, version, type, platform) {
  logger.debug(
    '===================START INSTALL CHAINCODE========================='
  );

  let errorMessage = '';
  const fabricClient = await platform.getClient();
  const client = fabricClient.hfc_client;
  const targets = [peer]; // build the list of peers that will require this chaincode
  const chaincodePath = path.join('tmp', 'src', `${name}${version}`);
  logger.debug('path', chaincodePath);
  console.log('path', chaincodePath);
  try {
    console.log('extractChaincodeZipArchive');
    extractChaincodeZipArchive(zip, chaincodePath);
  } catch (error) {
    console.log('unzip failed', error);
    fs.removeSync(chaincodePath);
    return {
      success: false,
      message: 'Failed to extract chaincode from zip archive'
    };
  }
  console.log('request');
  // send proposal to install
  const request = {
    targets,
    chaincodePath: type === 'golang' ? `${name}${version}` : chaincodePath,
    metadataPath: chaincodePath, // notice this is the new attribute of the request
    chaincodeId: name,
    chaincodeType: type,
    chaincodeVersion: version
  };

  try {
    console.log('client.installChaincode');
    const results = await client.installChaincode(request);
    const proposalResponses = results[0];
    const allGood = proposalResponses.every(
      val => val && val.response && val.response.status === 200
    );
    if (allGood) {
      logger.info(
        'Successfully sent install Proposal and received ProposalResponse'
      );
    } else {
      if (!errorMessage) {
        errorMessage =
          'Failed to send install Proposal or receive valid response.' +
          ' Response null or status is not 200';
      }
      logger.error(errorMessage);
    }
  } catch (error) {
    logger.error(
      `Failed to install due to error: ${error.stack}` ? error.stack : error
    );
    errorMessage = error.toString();
  } finally {
    // fs.removeSync(chaincodePath);
  }

  if (!errorMessage) {
    const message = 'Successfully installed chaincode';
    logger.debug(message);
    return {
      success: true,
      message
    };
  }
  const message = util.format('Failed to install due to:%s', errorMessage);
  return {
    success: false,
    message
  };
}

async function instantiateChaincode(chaincodeRequest, txtype, platform) {
  logger.debug(
    '===================START INSTANTIATE CHAINCODE========================='
  );
  const {
    peers,
    name,
    version,
    channel: channelName,
    policy,
    args
  } = chaincodeRequest;
  let results;
  try {
    const chaincodePath = path.join('tmp', 'src', `${name}${version}`);

    const fabricClient = await platform.getClient();
    const client = fabricClient.hfc_client;
    const channel = client.getChannel(channelName, true);
    const tx_id = client.newTransactionID(true);

    const request = {
      targets: peers,
      chaincodePath,
      metadataPath: chaincodePath,
      chaincodeId: name,
      chaincodeType: 'node',
      chaincodeVersion: version,
      args,
      txId: tx_id
    };

    if (policy) {
      request['endorsement-policy'] =
        typeof policy === 'string' ? JSON.parse(policy) : policy;
    }

    logger.debug(
      'endorsement-policy',
      request['endorsement-policy'].identities,
      request['endorsement-policy'].policy
    );

    if (txtype === 'init') {
      results = await channel.sendInstantiateProposal(request, 60000);
    } else if (txtype === 'upgrade') {
      results = await channel.sendUpgradeProposal(request, 60000);
    }

    let flag = true;
    const proposalResponses = results[0];
    const proposal = results[1];
    for (const i in proposalResponses) {
      if (
        proposalResponses &&
        proposalResponses[i].response &&
        proposalResponses[i].response.status !== 200
      ) {
        flag = false;
        logger.info('instantiate proposal was bad');
        break;
      }
    }

    if (flag) {
      const orderer_request = {
        txId: tx_id,
        proposalResponses,
        proposal
      };
      results = await channel.sendTransaction(orderer_request);
      results.message =
        results.status === 'SUCCESS'
          ? 'Successfully instantiate chaincode'
          : ' Instantiate chaincode is failed';
    } else {
      results = {
        ...results,
        success: false,
        message: results[0].message
      };
      logger.info('instantiate false results: ', results);
    }
  } catch (error) {
    results = {
      data: results,
      message: error.toString(),
      success: false
    };
    logger.error('error on instantiating chaincode: ', error.toString());
  }
  logger.debug(
    '================END INSTANTIATE CHAINCODE======================'
  );
  logger.debug('instantiate final results: ', results);
  return results;
}

async function invokeChaincode(
  channelName,
  targets,
  ccId,
  fcn,
  args,
  platform
) {
  const client = platform.getClient().hfc_client;
  logger.debug(
    '\n============ invoke transaction on channel %s ============\n'
  );
  try {
    logger.debug(
      'Successfully got the fabric client for the organization "%s"'
    );
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = 'Channel %s was not defined in the connection profile';
      logger.error(message);
      throw new Error(message);
    }
    const txId = client.newTransactionID(true);
    // send proposal to endorser
    const request = {
      txId,
      targets,
      chaincodeId: ccId,
      fcn,
      args,
      chainId: channel.getName()
    };

    let results = await channel.sendTransactionProposal(request);
    console.log('req', request);
    console.log('res', results[0], new Date());

    const proposalResponses = results[0];
    const proposal = results[1];

    const all_good = proposalResponses.every(
      val => val && val.response && val.response.status === 200
    );

    if (all_good) {
      logger.info(
        'Successfully sent Proposal and received ProposalResponse:' +
          ' Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
        proposalResponses[0].response.status,
        proposalResponses[0].response.message,
        proposalResponses[0].response.payload,
        proposalResponses[0].endorsement.signature
      );

      const orderer_request = {
        proposalResponses,
        proposal
      };
      results = await channel.sendTransaction(orderer_request);
      console.log('results', results, new Date());
      logger.info('------->>> R E S P O N S E : %j', results);
      console.log(results);
      const response = results; //  orderer results are last in the results
      if (response.status === 'SUCCESS') {
        logger.info('Successfully sent transaction to the orderer.');
      } else {
        logger.debug(
          'Failed to order the transaction. Error code: %s',
          response.status
        );
      }
    } else {
      logger.error(
        'Failed to send Proposal and receive all good ProposalResponse'
      );
    }
  } catch (error) {
    logger.error(
      'Failed to invoke due to error: ',
      error.stack ? error.stack : error
    );
    throw error;
  }
}

// getPath();
exports.installChaincode = installChaincode;
exports.instantiateChaincode = instantiateChaincode;
exports.loadChaincodeSrc = loadChaincodeSrc;
exports.invokeChaincode = invokeChaincode;
