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


var query=require('../query.js')
var helper = require('../helper.js')
var co = require('co')
var stomp = require('../socket/websocketserver.js').stomp()
var logger = helper.getLogger('blockscanner');
var ledgerMgr = require('../utils/ledgerMgr.js')
var config=require('../../config.json')
var sql = require('../db/pgservice.js');

var blockListener

var networkConfig = config["network-config"];
var org = Object.keys(networkConfig)[0];
var orgObj = config["network-config"][org];
var orgKey = Object.keys(orgObj);
var index = orgKey.indexOf("peer1");
var peer = orgKey[index];

function syncBlock() {
    var channelName = ledgerMgr.getCurrChannel();
    let maxBlockNum
    let curBlockNum
    Promise.all([
        getMaxBlockNum(channelName),
        getCurBlockNum(channelName)
    ]).then(datas => {
        maxBlockNum = parseInt(datas[0])
        curBlockNum = parseInt(datas[1]) + 1
        co(saveBlockRange, channelName, curBlockNum, maxBlockNum).then(() => {
            blockListener.emit('syncBlock', channelName)
        }).catch(err => {
            logger.error(err)
        })
    }).catch(err => {
        logger.error(err)
    })


}

function* saveBlockRange(channelName, start, end) {
    while (start < end) {
        let block = yield query.getBlockByNumber(peer, channelName, start, org)
         /** block creation timestamp is not in the latest fabric API,
         will use the first transaction timestamp */
         let firstTxTimestamp = block.data.data[0].payload.header.channel_header.timestamp;
         if (!firstTxTimestamp) {
             firstTxTimestamp = null
         }
        blockListener.emit('createBlock', block)
        yield sql.saveRow('blocks',
            {
                'blocknum': start,
                'channelname': channelName,
                'prehash': block.header.previous_hash,
                'datahash': block.header.data_hash,
                'txcount': block.data.data.length,
                'createdt': new Date(firstTxTimestamp)
            })
        //push last block
        stomp.send('/topic/block/all', {}, start)
        start++

        //////////tx/////////////////////////
        let txLen = block.data.data.length
        for (let i = 0; i < txLen; i++) {
            let tx = block.data.data[i]
            let chaincode
            try {
                chaincode = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].namespace
            } catch (err) {
                chaincode = ""
            }
            console.dir(tx.payload.header.signature_header.creator.Mspid);
            yield sql.saveRow('transaction',
                {
                    'channelname': channelName,
                    'blockid': block.header.number.toString(),
                    'txhash': tx.payload.header.channel_header.tx_id,
                    'createdt': new Date(tx.payload.header.channel_header.timestamp),
                    'chaincodename': chaincode
                })
            yield sql.updateBySql(`update chaincodes set txcount =txcount+1 where name = '${chaincode}' and channelname='${channelName}' `)
        }

    }
    stomp.send('/topic/metrics/txnPerSec', {}, JSON.stringify({ timestamp: new Date().getTime() / 1000, value: 0 }))
}


function getMaxBlockNum(channelName) {
    return query.getChannelHeight(peer, channelName, org).then(data => {
        return data
    }).catch(err => {
        logger.error(err)
    })
}

function getCurBlockNum(channelName) {
    let curBlockNum
    return sql.getRowsBySQlCase(`select max(blocknum) as blocknum from blocks  where channelname='${channelName}'`).then(row => {
        if (row == null || row.blocknum == null) {
            curBlockNum = -1
        } else {
            curBlockNum = parseInt(row.blocknum)
        }

    }).then(() => {
        return curBlockNum
    }).catch(err => {
        logger.error(err)
    })
}

// ====================chaincodes=====================================
function* saveChaincodes(channelName) {
    let chaincodes = yield query.getInstalledChaincodes(peer, channelName, 'installed', org)
    let len = chaincodes.length
    if (typeof chaincodes === 'string') {
        logger.debug(chaincodes)
        return
    }
    for (let i = 0; i < len; i++) {
        let chaincode = chaincodes[i]
        chaincode.channelname = channelName
        let c = yield sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' and channelname='${channelName}' `)
        if (c.c == 0) {
            yield sql.saveRow('chaincodes', chaincode)
        }
    }

}

function* savePeerlist(channelName) {
    var array = Object.keys(networkConfig);
    var peerlists;
    array.forEach(function (element) {
        var peerlist = query.getPeerList(element, channelName);
        if (peerlists != undefined)
            peerlists = peerlists.concat(peerlist);
        else
            peerlists = peerlist;
    });
    let peerlen = peerlists.length
    for (let i = 0; i < peerlen; i++) {
        var peers = {};
        let peerlist = peerlists[i]
        peers.name = channelName;
        peers.requests = peerlist._url;
        peers.server_hostname = peerlist._options["grpc.default_authority"];
        let c = yield sql.getRowByPkOne(`select count(1) as c from peer where name='${peers.name}' and requests='${peers.requests}' `)
        if (c.c == 0) {
            yield sql.saveRow('peer', peers)
        }
    }
}

function syncChaincodes() {
    var channelName = ledgerMgr.getCurrChannel();
    co(saveChaincodes, channelName).then(() => {
        blockListener.emit('syncChaincodes', channelName)
    }).catch(err => {
        logger.error(err)
    })
}

function syncPeerlist() {
    var channelName = ledgerMgr.getCurrChannel();
    co(savePeerlist, channelName).then(() => {
        blockListener.emit('syncPeerlist', channelName)
    }).catch(err => {
        logger.error(err)
    })
}

exports.syncBlock = syncBlock
exports.syncChaincodes = syncChaincodes
exports.syncPeerlist = syncPeerlist

exports.setBlockListener = function (blisten) {
    blockListener = blisten
}