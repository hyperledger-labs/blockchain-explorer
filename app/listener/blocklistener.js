/*
 Copyright ONECHAIN 2017 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
var EventEmitter = require('events').EventEmitter;
var blockListener = new EventEmitter();

var blockScanner = require('../service/blockscanner.js')
blockScanner.setBlockListener(blockListener)

var channeleventhub = require('../platform/fabric/channeleventhublistener.js')

var blockMetrics = require('../metrics/metrics').blockMetrics
var txMetrics = require('../metrics/metrics').txMetrics


blockListener.on('createBlock', function (block) {
    blockMetrics.push(1)
    txMetrics.push(block.data.data.length)

})

blockListener.on('syncChaincodes', function () {
    setTimeout(function () {
        blockScanner.syncChaincodes()
    }, 1000)
})

blockListener.on('syncPeerlist', function () {
    setTimeout(function () {
        blockScanner.syncPeerlist()
    }, 1000)
})

blockListener.on('syncChannels', function () {
    setTimeout(function () {
        blockScanner.syncChannels()
    }, 1000)
})

blockListener.on('syncBlock', function () {
    setTimeout(function () {
        blockScanner.syncBlock()
    }, 1000)
})

blockListener.on('syncChannelEventHubBlock', function () {
    setTimeout(function () {
        channeleventhub.syncChannelEventHubBlock(blockScanner.saveBlockRange)
    }, 1000)
})


exports.blockListener = function () {
    return blockListener
}