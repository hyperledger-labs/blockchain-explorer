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


var query = require('../query.js')
var helper = require('../helper.js')
var co = require('co')
var logger = helper.getLogger('blockscanner');
var ledgerMgr = require('../utils/ledgerMgr.js')
var config = require('../../config.json')
var sql = require('../db/pgservice.js');
var wss = require('../../main.js');
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
        var notify = {
            'title': 'Block Added',
            'type': 'block',
            'message': 'Block ' + start + ' established with ' + block.data.data.length + ' tx',
            'time': new Date(firstTxTimestamp)
        };
        wss.broadcast(notify);
        start++

        //////////tx/////////////////////////
        let txLen = block.data.data.length
        for (let i = 0; i < txLen; i++) {
            let tx = block.data.data[i]
            let chaincode
            try {
                chaincode = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].namespace
            } catch (err) {
            }

            let rwset
            let readSet
            let writeSet
            try {
                rwset = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset
                readSet = rwset.map(i => { return { 'chaincode': i.namespace, 'set': i.rwset.reads } })
                writeSet = rwset.map(i => { return { 'chaincode': i.namespace, 'set': i.rwset.writes } })
            } catch (err) {
            }

            let chaincodeID
            try {
                chaincodeID = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.chaincode_id.name
            } catch (err) {
            }

            let status
            try {
                status = tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.status
            } catch (err) {
                status = 0
            }

            let mspId = []
            try {
                mspId = tx.payload.data.actions[0].payload.action.endorsements.map(i => { return i.endorser.Mspid })
            } catch (err) {
            }

            let payload
            try{
                payload=JSON.stringify(tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.payload)
            } catch(err) {
            }

            yield sql.saveRow('transaction',
                {
                    'channelname': channelName,
                    'blockid': block.header.number,
                    'txhash': tx.payload.header.channel_header.tx_id || "0x00",
                    'createdt': new Date(tx.payload.header.channel_header.timestamp),
                    'chaincodename': chaincode || "None",
                    'status': status,
                    'creator_msp_id': tx.payload.header.signature_header.creator.Mspid,
                    'endorser_msp_id': mspId,
                    'chaincode_id': chaincodeID || "None",
                    'type': tx.payload.header.channel_header.typeString,
                    'payload': payload || "None",
                    'read_set': JSON.stringify(readSet),
                    'write_set': JSON.stringify(writeSet)
                })

            yield sql.updateBySql(`update chaincodes set txcount =txcount+1 where name = '${chaincode}' and channelname='${channelName}' `)
        }

    }
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
        if (chaincode.name.indexOf("exchange") >= 0) {
            chaincode.channelname = 'exchange-channel'
        } else {
            chaincode.channelname = 'private-channel'
        }
        // chaincode.channelname = channelName
        let c = yield sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' `)
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
