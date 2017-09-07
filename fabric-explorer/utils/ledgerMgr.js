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
var ledgerEvent = new EventEmitter();
var config=require('../config.json')

var channels=config.channelsList

var currChannel=channels[0]

function changeChannel(channelName){
    currChannel=channelName
    ledgerEvent.emit('channgelLedger')
}

function getCurrChannel(){
    return currChannel
}

function getChannellist(){
    return channels
}
exports.getCurrChannel=getCurrChannel
exports.changeChannel=changeChannel
exports.ledgerEvent=ledgerEvent
exports.getChannellist=getChannellist