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
var helper=require('../app/helper.js')
var path=require('path')


var hfc = require('fabric-client');
hfc.addConfigFile(path.join(__dirname, '/app/network-config.json'));
var ORGS = hfc.getConfigSetting('network-config');

var config = require('../config.json');

var query=require('../app/query.js')
var logger = helper.getLogger('bcservice');

// var bcserver = require('./bcservice');



/**
 * 获取所有的组织
 */
function getAllOrgs(){
    var OrgArray=[]
    for (let key in ORGS) {
        if (key.indexOf('org') === 0) {
            let orgName = ORGS[key].name;
            OrgArray.push(orgName)
        }
    }
    return OrgArray

}


/**
 * 获取所有的peers的请求地址
 *
 * @returns {Array}
 */
function getAllPeerRequest() {

    var peerArray = []

    for (let key in ORGS) {
        if (key.indexOf('org') === 0) {
            let orgproperty = ORGS[key]
            for ( let orgkey in orgproperty){
                if(  orgkey.indexOf('peer') === 0 ){
                    var peerbean = {'name':orgkey,'org':key}
                    peerArray.push(peerbean)
                }
            }
        }
    }

    return peerArray;


}

/**
 * 获取所有的账本
 */
function getAllChannels(){


}

/**
 * 获取所有的节点
 */
function getallPeers () {

    var peerArray=[]
    for (let key in ORGS) {
        if (key.indexOf('org') === 0) {
            let peerName = ORGS[key].peer1.requests;
            peerArray.push(peerName)
        }
    }
    return peerArray

}

/**
 * 获取所有的账本
 */
function getAllChannels(){
    return config.channelsList

}

/**
 * 根据账本名称获取账本中的区块
 * @param channelname
 */
function getChainInfo( channelname ){
    return query.getChainInfo('peer1',channelname,'admin','org1')
}

/**
 * 根据区块编号获取区块详细信息
 * @param chainid
 */
function getBlock4Channel( channelName,blockNum ){
    return query.getBlockByNumber('peer1',blockNum ,'admin','org1')

}

/**
 * 获取channel中的交易
 * @param chainid
 */
function getTans4Chain( channelName,trxnID ) {
    return query.getTransactionByID('peer1',channelName, trxnID, 'admin', 'org1')

}


/**
 * 获取账本中的chaincode
 */
function getChainCode4Channel(channelName) {
    return query.getInstalledChaincodes('peer1',channelName, '', 'admin', 'org1')

}

function getBlockRange(from,to){

    var parms = [];
    for(var ind = from ; ind < to ; ind++){
        parms.push(query.getBlockByNumber('peer1','mychannel',ind,'admin','org1'));
    }

    return Promise.all(parms).then(datas=>{
        var block_array=[]
        datas.forEach((k,v) =>{
            var block_obj={}
            var num = k.header.number.toString();
            block_obj.num=num
            var previous_hash=k.header.previous_hash
            block_obj.previous_hash=previous_hash
            var data_hash=k.header.data_hash
            block_obj.data_hash=data_hash
            block_obj.tx=[]
            k.data.data.forEach(t=>{
                block_obj.tx.push(t.payload.header.channel_header.tx_id)
            })
            block_array.push(block_obj)
        })
        return Promise.resolve(block_array)
    }).catch(err=>{
        logger.error(err)
    })
}

function getTx(channelName,tx_array){
    let params=[]
    tx_array.forEach(tx=>{
        params.push(getTans4Chain(channelName,tx))
    })
    return Promise.all(params).then(datas=>{
        return Promise.resolve(datas)
    }).catch(err=>{
        logger.error(err)
    })
}


module.exports.getAllOrgs=getAllOrgs
module.exports.getAllPeerRequest = getAllPeerRequest
module.exports.getAllChannels=getAllChannels
module.exports.getallPeers=getallPeers
module.exports.getTans4Chain=getTans4Chain
module.exports.getChainCode4Channel=getChainCode4Channel
module.exports.getChainInfo=getChainInfo
module.exports.getBlock4Channel=getBlock4Channel
module.exports.getBlockRange=getBlockRange
module.exports.getTx=getTx

