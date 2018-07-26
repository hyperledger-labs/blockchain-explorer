/*
    SPDX-License-Identifier: Apache-2.0
*/

var path = require('path');
var fs = require('fs');
var sha = require('js-sha256');
var asn = require('asn1.js');

var generateDir = async function() {
  var tempDir = '/tmp/' + new Date().getTime();
  try {
    fs.mkdirSync(tempDir);
  } catch (err) {
    logger.error(err);
  }
  return tempDir;
};

var generateBlockHash = async function(header) {
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
};

exports.generateDir = generateDir;
exports.generateBlockHash = generateBlockHash;
