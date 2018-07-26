/*
*SPDX-License-Identifier: Apache-2.0
*/

var EventEmitter = require('events').EventEmitter;

var blockMetrics = require('./metrics').blockMetrics;
var txMetrics = require('./metrics').txMetrics;

class BlockListener extends EventEmitter {
  constructor(blockScanner) {
    super();
    this.blockScanner = blockScanner;

    this.on('createBlock', function(block) {
      blockMetrics.push(1);
      txMetrics.push(block.data.data.length);
    });

    this.on('syncChaincodes', function() {
      blockScanner.syncChaincodes();
    });

    this.on('syncPeerlist', function() {
      blockScanner.syncPeerlist();
    });

    this.on('syncChannels', function() {
      blockScanner.syncChannels();
    });
    // ====================Orderer BE-303=====================================
    this.on('syncOrdererlist', function() {
      blockScanner.syncOrdererlist();
    });
    // ====================Orderer BE-303=====================================
    this.on('syncBlock', async function() {
      await blockScanner.syncBlock();
      blockScanner.syncChannelEventHubBlock();
    });
  }
}
module.exports = BlockListener;
