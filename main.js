/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

var express = require("express");
var path = require('path');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var helper = require('./app/helper');
var requtil = require('./app/utils/requestutils.js')
var logger = helper.getLogger('main');
var txModel = require('./app/models/transactions.js')
var blocksModel = require('./app/models/blocks.js')
var configuration = require('./app/FabricConfiguration.js')
var chModel = require('./app/models/channel.js');
var url = require('url');
var WebSocket = require('ws');


var query = require('./app/query.js');
var ledgerMgr = require('./app/utils/ledgerMgr.js')

var timer = require('./app/timer/timer.js')
timer.start()


var statusMetrics = require('./app/service/metricservice.js')
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var config = require('./config.json');
var query = require('./app/query.js');
var sql = require('./app/db/pgservice.js');

var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;


var networkConfig = config["network-config"];
var org = Object.keys(networkConfig)[0];
var orgObj = config["network-config"][org];
var orgKey = Object.keys(orgObj);
var index = orgKey.indexOf("peer1");
var peer = orgKey[index];

// =======================   controller  ===================

/**
Return latest status
GET /api/status/get - > /api/status
curl -i 'http://<host>:<port>/api/status/<channel>'
Response:
{
  "chaincodeCount": 1,
  "txCount": 3,
  "latestBlock": 2,
  "peerCount": 1
}
 *
 */

app.get("/api/status/:channel", function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getStatus(channelName, function (data) {
            if (data && (data.chaincodeCount && data.txCount && data.latestBlock && data.peerCount)) {
                return res.send(data)
            } else {
                return requtil.notFound(req, res)
            }
        })
    }
    else {
        return requtil.invalidRequest(req, res)
    }
});


/**
Return list of channels
GET /channellist -> /api/channels
curl -i http://<host>:<port>/api/channels
Response:
{
  "channels": [
    {
    "channel_id": "mychannel"
    }
  ]
}
 */

app.get('/api/channels', function (req, res) {
    var channels = [], counter = 0;
    const orgs_peers = configuration.getOrgMapFromConfig();

    orgs_peers.forEach(function (org) {
        query.getChannels(org['value'], org['key']).then(channel => {
            channel['channels'].forEach(function (element) {
                channels.push(element['channel_id']);
            });
            if (counter == orgs_peers.length - 1) {
                var response = { status: 200 };
                response["channels"] = [...(new Set(channels))]
                res.send(response);
            }
            counter++;
        });
    })
})
/**
Return current channel
GET /api/curChannel
curl -i 'http://<host>:<port>/api/curChannel'
*/
app.get('/api/curChannel', function (req, res) {
    res.send({ 'currentChannel': ledgerMgr.getCurrChannel() })
})

/**
Return change channel
POST /api/changeChannel
curl -i 'http://<host>:<port>/api/curChannel'
*/
app.get('/api/changeChannel/:channelName',function(req,res){
    let channelName=req.params.channelName
    ledgerMgr.changeChannel(channelName)
    res.send({ 'currentChannel': ledgerMgr.getCurrChannel() })
})

/***
Block by number
GET /api/block/getinfo -> /api/block
curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
 *
 */
app.get("/api/block/:channel/:number", function (req, res) {
    let number = parseInt(req.params.number)
    let channelName = req.params.channel
    if (!isNaN(number) && channelName) {
        query.getBlockByNumber(peer, channelName, number, org)
            .then(block => {
                res.send({
                    status: 200,
                    'number': block.header.number.toString(),
                    'previous_hash': block.header.previous_hash,
                    'data_hash': block.header.data_hash,
                    'transactions': block.data.data
                })
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

/***
Transaction count
GET /api/block/get -> /api/block/transactions/
curl -i 'http://<host>:<port>/api/block/transactions/<channel>/<number>'
Response:
{
  "number": 2,
  "txCount": 1
}
 */
app.get("/api/block/transactions/:channel/:number", function (req, res) {
    let number = parseInt(req.params.number)
    let channelName = req.params.channel
    if (!isNaN(number) && channelName) {
        sql.getRowByPkOne(`select blocknum ,txcount from blocks where channelname='${channelName}' and blocknum=${number} `).then(row => {
            if (row) {
                return res.send({
                    status: 200,
                    'number': row.blocknum,
                    'txCount': row.txcount
                })
            }
            return requtil.notFound(req, res)
        })
    } else {
        return requtil.invalidRequest(req, res)
    }
});
//
/***
Transaction Information
GET /api/tx/getinfo -> /api/transaction/<txid>
curl -i 'http://<host>:<port>/api/transaction/<channel>/<txid>'
Response:
{
  "tx_id": "header.channel_header.tx_id",
  "timestamp": "header.channel_header.timestamp",
  "channel_id": "header.channel_header.channel_id",
  "type": "header.channel_header.type"
}
 */

app.get("/api/transaction/:channel/:txid", function (req, res) {
    let txid = req.params.txid
    let channelName = req.params.channel
    if (txid && txid != '0' && channelName) {
        txModel.getTransactionByID(channelName, txid).then(row => {
            if (row) {
                return res.send({ status: 200, row })
            }
        })
    } else {
        return requtil.invalidRequest(req, res)
    }
});


/***
Transaction list
GET /api/txList/
curl -i 'http://<host>:<port>/api/txList/<channel>/<blocknum>/<txid>/<limitrows>/<offset>'
Response:
{"rows":[{"id":56,"channelname":"mychannel","blockid":24,
"txhash":"c42c4346f44259628e70d52c672d6717d36971a383f18f83b118aaff7f4349b8",
"createdt":"2018-03-09T19:40:59.000Z","chaincodename":"mycc"}]}
 */
app.get("/api/txList/:channel/:blocknum/:txid", function (req, res) {

    let channelName = req.params.channel;
    let blockNum = parseInt(req.params.blocknum);
    let txid = parseInt(req.params.txid);

    if (isNaN(txid)) {
        txid = 0;
    }
    if (channelName) {
        txModel.getTxList(channelName, blockNum, txid)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});


/***Peer List
GET /peerlist -> /api/peers
curl -i 'http://<host>:<port>/api/peers/<channel>'
Response:
[
  {
    "requests": "grpcs://127.0.0.1:7051",
    "server_hostname": "peer0.org1.example.com"
  }
]
 */
app.get("/api/peers/:channel", function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getPeerList(channelName, function (data) {
            res.send({ status: 200, peers: data })
        })
    } else {
        return requtil.invalidRequest(req, res)
    }
});


/**
Chaincode list
GET /chaincodelist -> /api/chaincode
curl -i 'http://<host>:<port>/api/chaincode/<channel>'
Response:
[
  {
    "channelName": "mychannel",
    "chaincodename": "mycc",
    "path": "github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02",
    "version": "1.0",
    "txCount": 0
  }
]
 */

app.get('/api/chaincode/:channel', function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getTxPerChaincode(channelName, function (data) {
            res.send({ status: 200, chaincode: data })
        })
    } else {
        return requtil.invalidRequest(req, res)
    }
})

/***
 List of blocks and transaction list per block
GET /api/blockAndTxList
curl -i 'http://<host>:<port>/api/blockAndTxList/channel/<blockNum>/<limitrows>/<offset>'
Response:
{"rows":[{"id":51,"blocknum":50,"datahash":"374cceda1c795e95fc31af8f137feec8ab6527b5d6c85017dd8088a456a68dee",
"prehash":"16e76ca38975df7a44d2668091e0d3f05758d6fbd0aab76af39f45ad48a9c295","channelname":"mychannel","txcount":1,
"createdt":"2018-03-13T15:58:45.000Z","txhash":["6740fb70ed58d5f9c851550e092d08b5e7319b526b5980a984b16bd4934b87ac"]}]}
 *
 */

app.get("/api/blockAndTxList/:channel/:blocknum", function (req, res) {

    let channelName = req.params.channel;
    let blockNum = parseInt(req.params.blocknum);

    if (channelName && !isNaN(blockNum)) {
        blocksModel.getBlockAndTxList(channelName, blockNum)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

// TRANSACTION METRICS

/***
 Transactions per minute with hour interval
GET /api/txByMinute
curl -i 'http://<host>:<port>/api/txByMinute/<channel>/<hours>'
Response:
{"rows":[{"datetime":"2018-03-13T17:46:00.000Z","count":"0"},{"datetime":"2018-03-13T17:47:00.000Z","count":"0"},{"datetime":"2018-03-13T17:48:00.000Z","count":"0"},{"datetime":"2018-03-13T17:49:00.000Z","count":"0"},{"datetime":"2018-03-13T17:50:00.000Z","count":"0"},{"datetime":"2018-03-13T17:51:00.000Z","count":"0"},
{"datetime":"2018-03-13T17:52:00.000Z","count":"0"},{"datetime":"2018-03-13T17:53:00.000Z","count":"0"}]}

 */

app.get("/api/txByMinute/:channel/:hours", function (req, res) {
    let channelName = req.params.channel;
    let hours = parseInt(req.params.hours);

    if (channelName && !isNaN(hours)) {
        statusMetrics.getTxByMinute(channelName, hours)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

/***
 Transactions per hour(s) with day interval
GET /api/txByHour
curl -i 'http://<host>:<port>/api/txByHour/<channel>/<days>'
Response:
{"rows":[{"datetime":"2018-03-12T19:00:00.000Z","count":"0"},
{"datetime":"2018-03-12T20:00:00.000Z","count":"0"}]}
 */

app.get("/api/txByHour/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);

    if (channelName && !isNaN(days)) {
        statusMetrics.getTxByHour(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

// BLOCK METRICS

/***
 Blocks per minute with hour interval
GET /api/blocksByMinute
curl -i 'http://<host>:<port>/api/blocksByMinute/<channel>/<hours>'
Response:
{"rows":[{"datetime":"2018-03-13T19:59:00.000Z","count":"0"}]}

*/

app.get("/api/blocksByMinute/:channel/:hours", function (req, res) {
    let channelName = req.params.channel;
    let hours = parseInt(req.params.hours);

    if (channelName && !isNaN(hours)) {
        statusMetrics.getBlocksByMinute(channelName, hours)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});


/***
 Blocks per hour(s) with day interval
GET /api/blocksByHour
curl -i 'http://<host>:<port>/api/blocksByHour/<channel>/<days>'
Response:
{"rows":[{"datetime":"2018-03-13T20:00:00.000Z","count":"0"}]}

*/

app.get("/api/blocksByHour/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);

    if (channelName && !isNaN(days)) {
        statusMetrics.getBlocksByHour(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

/***
 Transactions by Organization(s)
GET /api/txByOrg
curl -i 'http://<host>:<port>/api/txByOrg/<channel>'
Response:
{"rows":[{"count":"4","creator_msp_id":"Org1"}]}

*/
app.get("/api/txByOrg/:channel", function (req, res) {
    let channelName = req.params.channel;

    if (channelName) {
        statusMetrics.getTxByOrgs(channelName)
            .then(rows => {
                if (rows) {
                    return res.send({ status: 200, rows })
                }
                return requtil.notFound(req, res)
            })
    } else {
        return requtil.invalidRequest(req, res)
    }
});

/***
    SETUP instructions for create new channel

    SET PATH to configtxgen tool in your .bashrc file

    On ubnuntu, you can use command
    $sudo nano ~/.bashrc
    export FABRIC_CFG_PATH=fabric-path/fabric-samples/first-network
    export PATH=$PATH:$FABRIC_CFG_PATH
    save the file and refresh, use command
    $source ~/.bashrc

    Update config.json file, look for the key configtxgenToolPath, should match your
    configtxgen tool path

    Update "fabric-path" in file /blockchain-explorer/app/config/network-config-tls.yaml to your
    fabric network path

    Everytime you add a new channel you need to define it in file:
    /blockchain-explorer/app/config/network-config-tls.yaml
    Search for keyword newchannel, and update it to the name of your new channel

    The values of the profile and genesisBlock are taken fron the configtx.yaml file that
    is used by the configtxgen tool
    Example values for:
    profile = 'TwoOrgsChannel';
    genesisBlock = 'TwoOrgsOrdererGenesis';
*/

/*
Create new channel
POST /api/channel

curl -X POST -H "Content-Type: application/json" -d '{"orgName":"Org1","channelName":"newchannel","profile" : "TwoOrgsChannel", "genesisBlock":"TwoOrgsOrdererGenesis" }' http://localhost:8080/api/channel
Response: {  success: true, message: "Successfully created channel "   }
*/

app.post('/api/channel', function (req, res) {
    var channelName = req.body.channelName;
    var orgName = req.body.orgName;
    var profile = req.body.profile;
    var genesisBlock = req.body.genesisBlock
    logger.debug("channelName, orgName, profile, genesisBlock ", channelName, orgName, profile, genesisBlock)

    if (channelName && orgName && profile && genesisBlock) {
        chModel.createChannel(channelName, orgName, profile, genesisBlock).then((resp) => {
            return res.send(resp);
        });

    } else {
        return requtil.invalidRequest(req, res)
    }
});

/***
    An API to join channel
POST /api/joinChannel

curl -X POST -H "Content-Type: application/json" -d '{ "orgName":"Org1","channelName":"newchannel"}' http://localhost:8080/api/joinChannel

Response: {  success: true, message: "Successfully joined peer to the channel "   }
*/

app.post('/api/joinChannel', function (req, res) {
    var channelName = req.body.channelName;
    var peers = req.body.peers;
    var orgName = req.body.orgName;
    if (channelName && peers && orgName) {
        chModel.joinChannel(channelName, peers, orgName).then((resp) => {
            return res.send(resp);
        })

    } else {
        return requtil.invalidRequest(req, res)
    }

});


//============ web socket ==============//
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

});

function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};
exports.wss = wss;
exports.broadcast = broadcast;
// ============= start server =======================
server.listen(port, function () {
    console.log(`Please open web browser to access ：http://${host}:${port}/`);
});


// this is for the unit testing
//module.exports = app;