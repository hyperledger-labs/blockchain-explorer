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

var sql=require('../db/mysqlservice.js')
var query=require('../app/query.js')
var helper=require('../app/helper.js')
var co=require('co')
var stomp=require('../socket/websocketserver.js').stomp()
var logger = helper.getLogger('blockscanner');

var blockListener


function  syncBlock(channelName) {
    let maxBlockNum
    let curBlockNum
    Promise.all([
        getMaxBlockNum(channelName),
        getCurBlockNum(channelName)
    ]).then(datas=>{
        maxBlockNum=parseInt(datas[0])
        curBlockNum=parseInt(datas[1])+1
        co(saveBlockRange,channelName,curBlockNum,maxBlockNum).then(()=>{
            blockListener.emit('syncBlock', channelName)
        }).catch(err=>{
            logger.error(err)
        })
    }).catch(err=>{
        logger.error(err)
    })


}

function* saveBlockRange(channelName,start,end){
    while(start<end){
        let block=yield query.getBlockByNumber('peer1',channelName,start,'admin','org1')
        blockListener.emit('createBlock',block)
        yield sql.saveRow('blocks',
            {
                'blocknum':start,
                'channelname':channelName,
                'prehash':block.header.previous_hash,
                'datahash':block.header.data_hash,
                'txcount':block.data.data.length
            })
        //push last block
        stomp.send('/topic/block/all',{},start)
        start++

        //////////tx/////////////////////////
        let txLen=block.data.data.length
        for(let i=0;i<txLen;i++){
            let tx=block.data.data[i]
            let chaincode
            try{
                chaincode=tx.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].namespace
            }catch(err) {
                chaincode=""
            }
            yield sql.saveRow('transaction',
                {
                    'channelname':channelName,
                    'blockid':block.header.number.toString(),
                    'txhash':tx.payload.header.channel_header.tx_id,
                    'createdt':new Date(tx.payload.header.channel_header.timestamp),
                    'chaincodename':chaincode
                })
            yield sql.updateBySql(`update chaincodes set txcount =txcount+1 where name = '${chaincode}' and channelname='${channelName}' `)
        }

    }
    stomp.send('/topic/metrics/txnPerSec',{},JSON.stringify({timestamp:new Date().getTime()/1000,value:0}))
}


function getMaxBlockNum(channelName){
    return query.getChannelHeight('peer1',channelName,'admin','org1').then(data=>{
        return data
    }).catch(err=>{
        logger.error(err)
    })
}

function getCurBlockNum(channelName){
    let curBlockNum
    return sql.getRowsBySQlCase(`select max(blocknum) as blocknum from blocks  where channelname='${channelName}'`).then(row=>{
        if(row.blocknum==null){
            curBlockNum=-1
        }else{
            curBlockNum=parseInt(row.blocknum)
        }

    }).then(()=>{
        return curBlockNum
    }).catch(err=>{
        logger.error(err)
    })
}

// syncBlock('mychannel')

// ====================chaincodes=====================================
function* saveChaincodes(channelName){
    let chaincodes=yield query.getInstalledChaincodes('peer1',channelName,'installed','admin','org1')
    let len=chaincodes.length
    if(typeof chaincodes ==='string'){
        logger.debug(chaincodes)
        return
    }
    for(let i=0;i<len;i++){
        let chaincode=chaincodes[i]
        chaincode.channelname=channelName
        let c= yield sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${chaincode.name}' and version='${chaincode.version}' and path='${chaincode.path}' and channelname='${channelName}' `)
        if(c.c==0){
            yield sql.saveRow('chaincodes',chaincode)
        }
    }

}

function syncChaincodes(channelName){
    co(saveChaincodes,channelName).then(()=>{
        blockListener.emit('syncChaincodes', channelName)
    }).catch(err=>{
        logger.error(err)
    })
}

// syncChaincodes('mychannel')

exports.syncBlock=syncBlock
exports.syncChaincodes=syncChaincodes

exports.setBlockListener=function(blisten){
    blockListener=blisten
}