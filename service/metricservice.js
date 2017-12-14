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

//var bcservice=require('./bcservice.js')
var sql=require('../db/mysqlservice.js')
var co=require('co')
var helper = require('../app/helper.js');
var query = require('../app/query.js');
var logger = helper.getLogger('metricservice');

var peerList;

//==========================query counts ==========================
function getChaincodeCount(channelName){
    return sql.getRowsBySQlCase(`select count(1) c from chaincodes where channelname='${channelName}' `)
}

function getPeerlistCount(channelName){
    return sql.getRowsBySQlCase(`select count(1) c from peer where name='${channelName}' `)
}

function getTxCount(channelName){
    return sql.getRowsBySQlCase(`select count(1) c from transaction where channelname='${channelName}'`)
}

function getBlockCount(channelName){
    return sql.getRowsBySQlCase(`select max(blocknum) c from blocks where channelname='${channelName}'`)
}

function* getPeerData(channelName){
    let peerArray=[]
    var c1 = yield sql.getRowsBySQlNoCondtion(`select c.name as name,c.requests as requests,c.server_hostname as server_hostname from peer c where c.name='${channelName}'`);
    for (var i = 0, len = c1.length; i < len; i++) {
        var item = c1[i];
        peerArray.push({'name':item.channelname,'requests':item.requests,'server_hostname':item.server_hostname})
    }
    return peerArray
}

function* getTxPerChaincodeGenerate(channelName){
    let txArray=[]
    var c = yield sql.getRowsBySQlNoCondtion(`select c.channelname as channelname,c.name as chaincodename,c.version as version,c.path as path ,txcount  as c from chaincodes c where  c.channelname='${channelName}' `);
    c.forEach((item,index)=>{
        txArray.push({'channelName':item.channelname,'chaincodename':item.chaincodename,'path':item.path,'version':item.version,'txCount':item.c})
    })
    return txArray

}

function getTxPerChaincode(channelName,cb) {
    co(getTxPerChaincodeGenerate,channelName).then(txArray=>{
        cb(txArray)
    }).catch(err=>{
        logger.error(err)
        cb([])
    })
}

function* getStatusGenerate(channelName){
    var chaincodeCount=yield  getChaincodeCount(channelName)
    var txCount=yield  getTxCount(channelName)
    var blockCount=yield  getBlockCount(channelName)
    blockCount.c=blockCount.c ? blockCount.c: 0
    var peerCount=  yield  getPeerlistCount(channelName)
    peerCount.c=peerCount.c ? peerCount.c: 0
    return {'chaincodeCount':chaincodeCount.c,'txCount':txCount.c,'latestBlock':blockCount.c,'peerCount':peerCount.c}
}

function getStatus(channelName ,cb){
    co(getStatusGenerate,channelName).then(data=>{
        cb(data)
    }).catch(err=>{
        logger.error(err)
    })
}

function getPeerList(channelName ,cb){
    co(getPeerData,channelName).then(peerArray=>{
        cb(peerArray)
    }).catch(err=>{
        logger.error(err)
        cb([])
    })
}

exports.getStatus=getStatus
exports.getTxPerChaincode=getTxPerChaincode
exports.getPeerList=getPeerList