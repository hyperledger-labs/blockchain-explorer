/*
*SPDX-License-Identifier: Apache-2.0
*/

var EventEmitter = require('events').EventEmitter;

var blockMetrics = require('../metrics/metrics').blockMetrics
var txMetrics = require('../metrics/metrics').txMetrics

class  BlockListener extends EventEmitter{

        constructor(blockScanner)
        {
            super();
            this.blockScanner = blockScanner;

            this.on('createBlock', function (block) {
                blockMetrics.push(1)
                txMetrics.push(block.data.data.length)

            });

            this.on('syncChaincodes', function () {
                setTimeout(function () {
                    blockScanner.syncChaincodes()
                }, 1000)
            });

            this.on('syncPeerlist', function () {
                setTimeout(function () {
                    blockScanner.syncPeerlist()
                }, 2000)
            });

            this.on('syncChannels', function () {
                setTimeout(function () {
                    blockScanner.syncChannels()
                }, 2000)
            });

            this.on('syncBlock', function () {
                setTimeout(function () {
                    blockScanner.syncBlock()
                }, 2000)
            });

            this.on('syncChannelEventHubBlock', function () {
                setTimeout(function () {
                    blockScanner.syncChannelEventHubBlock();
                }, 2000)
            });
        }
}

module.exports = BlockListener;