var helper=require('./helper.js')
var query=require('./query.js')

/*
helper.getOrgAdmin('org1').then(user =>{
    console.info(user)
}).catch(err =>{
    console.info(err)
})

helper.getAdminUser('org1').then(user =>{
    console.info(user)
}).catch(err =>{
    console.info(err)
})
*/


/*query.getBlockByNumber('peer1','mychannel',58,'admin','org1').then(response_payloads=>{
    console.info("==========================================")
    // console.info(JSON.stringify(response_payloads.data.data[0]))

     var head = response_payloads.header;
    for( key in head){
    console.log(` <div class="form-group"><label class="col-sm-2 control-label">${key}:</label>
                   <div class="col-sm-10"><input type="text" class="form-control" value="<%=head.${key}%>"></div>
                </div> `)
    }

    var txs = response_payloads.data.data;
    console.info(JSON.stringify(txs))

    var txs = response_payloads.metadata.metadata;

    var data1 = txs[0];

    var signatures = data1['signatures'][0]['signature_header']['creator']

    //console.info(JSON.stringify(signatures))


}).catch(err =>{

    console.info(err)

})*/


/*
query.getTransactionByID('peer1','mychannel','db1e504c36c697f6310010c462da2966e1adc652b213457d4561820dd015a992','admin','org1').then(response_payloads=>{
    //console.info(JSON.stringify(response_payloads))

    var sig = response_payloads['transactionEnvelope']['signature']

    console.log(sig.toString("hex"))

    var payload = response_payloads['transactionEnvelope']['payload']['header']['channel_header']

    //console.info(JSON.stringify(payload))


    for( key in payload){

        console.log(` <div class="form-group">
                           <label class="col-sm-2 control-label">${key}:</label>
                            <div class="col-sm-10"><input type="text" class="form-control" value="${payload[key]}"></div>
                      </div> `)

    }


}).catch(err=>{
    console.info(err)
})
*/



/*query.getBlockByHash('peer1','6f0ebf8c878a90072602c0f9c5de7f14081753caa81b0a5a314b166fdb73ee44','admin','org1').then(response_payloads=>{
    console.info(response_payloads)
}).catch(err=>{
    console.info(err)
})*/

/*
query.getChainInfo('peer1','mychannel','admin','org1').then(response_payloads=>{
    console.info(response_payloads)
}).catch(err=>{
    console.info(err)
})*/

/*query.getInstalledChaincodes('peer1','mychannel','installed','admin','org1').then(response=>{
    console.info(response)
}).catch(err=>{
    console.info(err)
})*/

/*
query.getChannels('peer1','admin','org1').then(response=>{
    console.info(response)
}).catch(err=>{
    console.info(err)
})
*/

/*function getTxCount(){
    return Promise.all([
            query.getBlockByNumber('peer1','mychannel',0,'admin','org1'),
            query.getBlockByNumber('peer1','mychannel',1,'admin','org1'),
            query.getBlockByNumber('peer1','mychannel',2,'admin','org1'),
            query.getBlockByNumber('peer1','mychannel',3,'admin','org1')
        ]
    ).then(datas=>{
        let txcount=0
        datas.forEach((k,v) =>{
            txcount+=k.data.data.length
        })
        return Promise.resolve(txcount)
    }).catch(err=>{
        console.info(err)
    })
}
getTxCount().then(txcount=>{
    console.info(txcount)
})*/


query.getBlockByNumber('peer1','mychannel',4,'admin','org1').then(block=>{
    console.info("==========================================")
    // console.info(JSON.stringify(response_payloads.data.data[0]))
    var block_obj={}
    var num = block.header.number.toString();
    block_obj.num=num
    var previous_hash=block.header.previous_hash
    block_obj.previous_hash=previous_hash
    var data_hash=block.header.data_hash
    block_obj.data_hash=data_hash

    console.info(JSON.stringify(block_obj))
}).catch(err =>{
    console.info(err)
})