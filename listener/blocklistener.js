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

var blockScanner=require('../service/blockscanner.js')
blockScanner.setBlockListener(blockListener)

var blockMetrics=require('../metrics/metrics').blockMetrics
var txMetrics=require('../metrics/metrics').txMetrics

var stomp=require('../socket/websocketserver.js').stomp()

blockListener.on('createBlock',function (block) {
    blockMetrics.push(1)
    txMetrics.push(block.data.data.length)

    stomp.send('/topic/block',{},JSON.stringify({'number':block.header.number.toString(),'txCount':block.data.data.length}))

    stomp.send('/topic/metrics/txnPerSec',{},JSON.stringify({timestamp:new Date().getTime()/1000,value:block.data.data.length/10}))
})

blockListener.on('syncBlock',function (channelName) {
    setTimeout(function () {
        blockScanner.syncBlock(channelName)
    },1000)
})

blockListener.on('syncChaincodes',function (channelName) {
    setTimeout(function () {
        blockScanner.syncChaincodes(channelName)
    },1000)
})

exports.blockListener=function () {
    return blockListener
}