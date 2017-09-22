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

var Metrics=require('../metrics/metrics.js')
var blockListener=require('../listener/blocklistener.js').blockListener()

var blockPerMinMeter=Metrics.blockMetrics
var txnPerSecMeter=Metrics.txnPerSecMeter
var txnPerMinMeter=Metrics.txMetrics

var stomp=require('../socket/websocketserver.js').stomp()

var statusMertics=require('../service/metricservice.js')

var ledgerMgr=require('../utils/ledgerMgr.js')

var ledgerEvent=ledgerMgr.ledgerEvent
ledgerEvent.on('channgelLedger',function(){
    blockPerMinMeter.clean()
    txnPerSecMeter.clean()
    txnPerMinMeter.clean()
})

function start() {

    
    setInterval(function () {
        blockPerMinMeter.push(0)
        txnPerSecMeter.push(0)
        txnPerMinMeter.push(0)
    },500)

    /*
    * /topic/metrics/txnPerSec
    * /topic/block/all
    * /topic/transaction/all
    */
    //pushTxnPerMin pushBlockPerMin /topic/metrics/
    setInterval(function () {
        stomp.send('/topic/metrics/blockPerMinMeter',{},JSON.stringify({timestamp:new Date().getTime()/1000,value:blockPerMinMeter.sum()}))
        stomp.send('/topic/metrics/txnPerMinMeter',{},JSON.stringify({timestamp:new Date().getTime()/1000,value:txnPerMinMeter.sum()}))
    },1000)

    //push status
    setInterval(function () {
        statusMertics.getStatus(ledgerMgr.getCurrChannel(),function (status) {
            stomp.send('/topic/metrics/status',{},JSON.stringify(status))
        })
    },1000)

    //push chaincode per tx
 /*   setInterval(function(){
        statusMertics.getTxPerChaincode(ledgerMgr.getCurrChannel(),function(txArray){
            stomp.send('/topic/metrics/txPerChaincode',{},JSON.stringify(txArray))
        })
    },1000)*/

    //同步区块
    blockListener.emit('syncChaincodes', ledgerMgr.getCurrChannel())
    blockListener.emit('syncBlock', ledgerMgr.getCurrChannel())

}


exports.start=start

