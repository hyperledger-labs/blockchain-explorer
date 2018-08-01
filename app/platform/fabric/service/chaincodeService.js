/*
*SPDX-License-Identifier: Apache-2.0
*/
var child_process = require('child_process');
var fs = require('fs');
// var path = "/chaincode/chaincode_example02/go/";
var path = '/home/maedwards/example_cc/';
var regXjs = '[a-z,A-Z,0-9]*.js$';
var regXgo = '[a-z,A-Z,0-9]*.go$';
var location;
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

loadChaincodeSrc(path);
// getPath();
exports.loadChaincodeSrc = loadChaincodeSrc;
