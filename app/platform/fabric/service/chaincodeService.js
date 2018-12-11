/* eslint-disable no-else-return */
/* eslint-disable arrow-parens */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/*
 *SPDX-License-Identifier: Apache-2.0
 */

const child_process = require('child_process');
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

const MAC_FIND_CMD = 'locate ';
const CURRENT_OS = process.platform;
let locate_cmd = 'locate -r ';
if (CURRENT_OS === 'darwin') {
  locate_cmd = MAC_FIND_CMD;
}

function extractChaincodeZipArchive(fileContent, folderName) {
  const zip = new AdmZip(fileContent.data);
  zip.extractAllTo(folderName, true);
}

async function loadChaincodeSrc(path) {
  if (path.substring(0, 10) === 'github.com') {
    path = path.slice(10);
  }
  try {
    if (CURRENT_OS === 'darwin') {
      location = await child_process.execSync(locate_cmd).toString();
    }
    {
      location = await child_process
        .execSync(locate_cmd + path + regXgo)
        .toString();
    }
  } catch (error) {
    try {
      if (CURRENT_OS === 'darwin') {
        location = await child_process.execSync(locate_cmd).toString();
      }
      {
        location = await child_process
          .execSync(locate_cmd + path + regXjs)
          .toString();
      }
    } catch (error) {
      try {
        location = await child_process.execSync(locate_cmd + path).toString();
      } catch (error) {
        location = errors.lnf;
      }
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
      chaincodePath = location[0];
    } else {
      chaincodePath = location.split('\n');
    }
    if (Array.isArray(chaincodePath) && chaincodePath[0]) {
      chaincodePath = chaincodePath[0];
      chaincodePath = chaincodePath.trim();
    }

    let locationDirectory = chaincodePath.split('/');
    locationDirectory = locationDirectory
      .slice(0, locationDirectory.length - 1)
      .join('/');
    if (locationDirectory) {
      fs.chmodSync(locationDirectory.trim(), '775');
    } else {
      return errors.lnf;
    }
  } catch (error) {
    return errors.lnf;
  }
  try {
    ccSource = await child_process.execSync(`cat ${chaincodePath}`);
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
  const client = await platform.getClient();
  const targets = [peer]; // build the list of peers that will require this chaincode
  const chaincodePath = path.join('tmp', `${Date.now()}`);
  try {
    extractChaincodeZipArchive(zip, chaincodePath);
  } catch (error) {
    fs.removeSync(chaincodePath);
    return {
      success: false,
      message: 'Failed to extract chaincode from zip archive'
    };
  }

  console.log('extracted');
  // send proposal to install
  const request = {
    targets: targets,
    chaincodePath: chaincodePath,
    metadataPath: chaincodePath, // notice this is the new attribute of the request
    chaincodeId: name,
    chaincodeType: type,
    chaincodeVersion: version
  };

  try {
    const results = await client.hfc_client.installChaincode(request);
    console.log('install');
    const proposalResponses = results[0];
    let allGood = true;
    for (const i in proposalResponses) {
      let oneGood = false;
      if (
        proposalResponses &&
        proposalResponses[i].response &&
        proposalResponses[i].response.status === 200
      ) {
        oneGood = true;
        logger.info('install proposal was good');
      } else {
        logger.error(
          'install proposal was bad %s',
          proposalResponses.toString()
        );
      }
      allGood &= oneGood;
    }
    if (allGood) {
      logger.info(
        'Successfully sent install Proposal and received ProposalResponse'
      );
    } else {
      errorMessage =
        'Failed to send install Proposal or receive valid response. Response null or status is not 200';
      logger.error(errorMessage);
    }
  } catch (error) {
    logger.error(
      `Failed to install due to error: ${error.stack}` ? error.stack : error
    );
    errorMessage = error.toString();
  } finally {
    fs.removeSync(chaincodePath);
  }

  if (errorMessage !== '') {
    const message = 'Successfully installed chaincode';
    logger.debug(message);
    return {
      success: true,
      message
    };
  } else {
    const message = util.format('Failed to install due to:%s', errorMessage);
    return {
      success: false,
      message
    };
  }
}

async function instantiateChaincode(
  peer,
  name,
  zip,
  version,
  type,
  channel,
  platform
) {
  logger.debug(
    '===================START INSTANTIATE CHAINCODE========================='
  );
  const results = '';
  /*
  let client = await platform.getClientFromPath(org, orgPath, networkCfgPath);
  let channel = client.getChannel(channelName, true);
  let tx_id = client.newTransactionID(true);

  let request = {
    targets: peers,
    chaincodeId: name,
    chaincodeVersion: version,
    args: args,
    txId: tx_id
  };

  try {
    if ('init' === txtype) {
      results = await channel.sendInstantiateProposal(request, 60000); //instantiate takes much longer
    } else if ('upgrade' === txtype) {
      results = await channel.sendUpgradeProposal(request, 60000); // upgrade takes much longer
    }

    let flag = true;
    let proposalResponses = results[0];
    let proposal = results[1];
    for (let i in proposalResponses) {
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
      let orderer_request = {
        txId: tx_id,
        proposalResponses: proposalResponses,
        proposal: proposal
      };
      results = await channel.sendTransaction(orderer_request);
      results.status === 'SUCCESS'
        ? (results.message = 'Successfully instantiate chaincode')
        : (results.message = ' Instantiate chaincode is failed');
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
  */
}

// getPath();
exports.installChaincode = installChaincode;
exports.instantiateChaincode = instantiateChaincode;
exports.loadChaincodeSrc = loadChaincodeSrc;
