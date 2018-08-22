/*
    SPDX-License-Identifier: Apache-2.0
*/
var multer = require('multer');

function invalidRequest(req, res) {
  let payload = reqPayload(req);
  res.send({
    status: 400,
    error: 'BAD REQUEST',
    payload: payload
  });
}

function notFound(req, res) {
  let payload = reqPayload(req);
  res.send({
    status: 404,
    error: 'NOT FOUND',
    payload: payload
  });
}

function reqPayload(req) {
  let reqPayload = [];
  const { params, query, body } = req;

  reqPayload.push({
    params: params
  });

  reqPayload.push({
    query: query
  });

  reqPayload.push({
    body: body
  });
  return reqPayload;
}

/**
 * Upload channel artifacts(channel and org configuration) and call SDK for NODEjs to create a channel
 */

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, '/tmp');
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});

// set to upload 2 files, can be increased by updating array
var upload = multer({
  storage: storage
}).array('channelArtifacts', 2);

function aSyncUpload(req, res) {
  return new Promise(function(resolve, reject) {
    upload(req, res, function(err) {
      var channelTxPath = null;
      var blockPath = null;
      var channelName = req.body.channelName;
      var orgName = req.body.orgName;
      var profile = req.body.profile;
      var genesisBlock = req.body.genesisBlock;
      var configFiles = req.files;
      var channelConfigPath = null;
      var channelConfigName = null;
      var orgConfigPath = null;
      var orgConfigName = null;
      var channelHash = null;

      if (channelName && orgName && profile && configFiles) {
        channelConfigPath = configFiles[0].path;
        orgConfigPath = configFiles[1].path;
        channelConfigName = configFiles[0].originalname;
        orgConfigName = configFiles[1].originalname;

        let fileAtifacts = {
          blockPath: blockPath,
          channelName: channelName,
          orgName: orgName,
          profile: profile,
          genesisBlock: genesisBlock,
          configFiles: configFiles,
          channelConfigName: channelConfigName,
          orgConfigName: orgConfigName,
          channelConfigPath: channelConfigPath,
          orgConfigPath: orgConfigPath,
          channelTxPath: '',
          channelHash: ''
        };

        if (err) {
          reject(err);
        }

        if (fileAtifacts) resolve(fileAtifacts);
        else resolve({});
      } else {
        let response = {
          success: false,
          message: 'Invalid request, payload'
        };
        reject(response);
      }
    });
  });
}

var orgsArrayToString = function(orgs) {
  //  console.log('orgs asfasf', orgs)
  let temp = '';
  if (typeof orgs === 'array' || typeof orgs === 'object') {
    orgs.forEach((element, i) => {
      temp += `'` + element + `'`;
      if (orgs.length - 1 != i) {
        temp += ',';
      }
    });
  } else if (orgs) {
    temp = `'` + orgs + `'`;
  }
  return temp;
};
var queryDatevalidator = function(from, to) {
  let today = new Date().toISOString();
  if (!isNaN(Date.parse(from)) && !isNaN(Date.parse(to))) {
    from = new Date(from).toISOString();
    to = new Date(to).toISOString();
  } else {
    from = new Date(Date.now() - 864e5).toISOString();
    to = new Date().toISOString();
  }
  return { from, to };
};

module.exports = {
  invalidRequest,
  notFound,
  reqPayload,
  aSyncUpload,
  orgsArrayToString,
  queryDatevalidator
};
