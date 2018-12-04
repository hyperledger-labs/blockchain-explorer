/*
 *SPDX-License-Identifier: Apache-2.0
 */

var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
let helper = require('../../../common/helper');
var logger = helper.getLogger('chaincodeService');

var regXjs = '[a-z,A-Z,0-9]*.js$';
var regXgo = '[a-z,A-Z,0-9]*.go$';
var location;

var pathUtil = require('path');
var orgPath = pathUtil.join(__dirname, '../artifacts/channel/org1.yaml');
var networkCfgPath = pathUtil.join(
  __dirname,
  '../artifacts/channel/network-config-tls.yaml'
);
const defaultOrg = 'Org1';

const errors = {
  lnf: 'Location not found',
  erf: 'Error reading file'
};

var MAC_FIND_CMD = 'locate ';
var CURRENT_OS = process.platform;
let locate_cmd = 'locate -r ';
if (CURRENT_OS === 'darwin') {
  locate_cmd = MAC_FIND_CMD;
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
  var ccSource;
  var chaincodePath;

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

    var locationDirectory = chaincodePath.split('/');
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
    ccSource = await child_process.execSync('cat ' + chaincodePath);
  } catch (error) {
    return errors.erf;
  }
  ccSource = ccSource.toString();
  return ccSource;
}

async function installChaincode(
  peers,
  orgName,
  name,
  path,
  version,
  type,
  platform
) {
  logger.debug(
    '===================START INSTALL CHAINCODE========================='
  );
  let error_message = null;
  let message = '';
  let response = {};
  let results = '';
  let org = !orgName ? defaultOrg : orgName;
  let client = await platform.getClientFromPath(org, orgPath, networkCfgPath);
  let request = {
    targets: peers,
    chaincodePath: path,
    chaincodeId: name,
    chaincodeVersion: version,
    chaincodeType: type
  };
  try {
    results = await client.installChaincode(request);
    let proposalResponses = results[0];

    let all_good = true;
    for (var i in proposalResponses) {
      let one_good = false;
      if (
        proposalResponses &&
        proposalResponses[i].response &&
        proposalResponses[i].response.status === 200
      ) {
        one_good = true;
        console.log('install proposal was good');
      } else {
        logger.error(
          'install proposal was bad %s',
          proposalResponses.toString()
        );
      }
      all_good = all_good & one_good;
    }
    if (all_good) {
      console.log(
        'Successfully sent install Proposal and received ProposalResponse'
      );
    } else {
      error_message =
        'Failed to send install Proposal or receive valid response. Response null or status is not 200';
      logger.error(error_message);
    }
  } catch (error) {
    logger.error(
      'Failed to install due to error: ' + error.stack ? error.stack : error
    );
    error_message = error.toString();
  }

  if (!error_message) {
    message = 'Successfully install chaincode';
    logger.debug(message);
    response = {
      success: true,
      message: message
    };
  } else {
    message = util.format('Failed to install due to:%s', error_message);
    response = {
      success: false,
      message: message
    };
  }
  return response;
}

async function instantiateChaincode(
  channelName,
  peers,
  orgName,
  name,
  version,
  orgName,
  txtype,
  policy,
  args,
  platform
) {
  logger.debug(
    '===================START INSTANTIATE CHAINCODE========================='
  );
  let results = '';
  let org = !orgName ? defaultOrg : orgName;
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
}

// getPath();
exports.installChaincode = installChaincode;
exports.instantiateChaincode = instantiateChaincode;
exports.loadChaincodeSrc = loadChaincodeSrc;
