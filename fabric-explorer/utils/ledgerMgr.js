
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