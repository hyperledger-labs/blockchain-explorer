/*
    SPDX-License-Identifier: Apache-2.0
*/
const multer = require('multer');

function invalidRequest(req, res) {
  const payload = reqPayload(req);
  res.send({
    status: 400,
    error: 'BAD REQUEST',
    payload
  });
}

function notFound(req, res) {
  const payload = reqPayload(req);
  res.send({
    status: 404,
    error: 'NOT FOUND',
    payload
  });
}

function reqPayload(req) {
  const reqPayload = [];
  const { params, query, body } = req;

  reqPayload.push({
    params
  });

  reqPayload.push({
    query
  });

  reqPayload.push({
    body
  });
  return reqPayload;
}

/**
 * Upload channel artifacts(channel and org configuration) and call SDK for NODEjs to create a channel
 */

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, '/tmp');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  }
});

// set to upload 2 files, can be increased by updating array
const upload = multer({
  storage
}).array('channelArtifacts', 2);

function aSyncUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      const channelTxPath = null;
      const blockPath = null;
      const channelName = req.body.channelName;
      const orgName = req.body.orgName;
      const profile = req.body.profile;
      const genesisBlock = req.body.genesisBlock;
      const configFiles = req.files;
      let channelConfigPath = null;
      let channelConfigName = null;
      let orgConfigPath = null;
      let orgConfigName = null;
      const channelHash = null;

      if (channelName && orgName && profile && configFiles) {
        channelConfigPath = configFiles[0].path;
        orgConfigPath = configFiles[1].path;
        channelConfigName = configFiles[0].originalname;
        orgConfigName = configFiles[1].originalname;

        const fileAtifacts = {
          blockPath,
          channelName,
          orgName,
          profile,
          genesisBlock,
          configFiles,
          channelConfigName,
          orgConfigName,
          channelConfigPath,
          orgConfigPath,
          channelTxPath: '',
          channelHash: ''
        };

        if (err) {
          reject(err);
        }

        if (fileAtifacts) resolve(fileAtifacts);
        else resolve({});
      } else {
        const response = {
          success: false,
          message: 'Invalid request, payload'
        };
        reject(response);
      }
    });
  });
}

const orgsArrayToString = function (orgs) {
  let temp = '';
  if (typeof orgs === 'array' || typeof orgs === 'object') {
    orgs.forEach((element, i) => {
      temp += `'${element}'`;
      if (orgs.length - 1 != i) {
        temp += ',';
      }
    });
  } else if (orgs) {
    temp = `'${orgs}'`;
  }
  return temp;
};
const queryDatevalidator = function (from, to) {
  const today = new Date().toISOString();
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
