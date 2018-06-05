/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

var express = require("express");
var path = require("path");
var app = express();
var http = require("http");
var bodyParser = require("body-parser");
var helper = require("./app/helper");
var requtil = require("./app/utils/requestutils.js");
var logger = helper.getLogger("main");
var txModel = require("./app/models/transactions.js");
var blocksModel = require("./app/models/blocks.js");
var configuration = require("./app/platform/fabric/FabricConfiguration.js");
var chModel = require("./app/models/channel.js");
var chs = require("./app/service/channelservice.js");
var url = require("url");
var WebSocket = require("ws");
var timer = require("./app/timer/timer.js");
var ledgerMgr = require("./app/utils/ledgerMgr.js");
var config = require("./appconfig.json");
var PlatformBuilder = require("./app/platform/PlatformBuilder.js");

var statusMetrics = require("./app/service/metricservice.js");
app.use(express.static(path.join(__dirname, "client/build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var appconfig = require("./appconfig.json");
var sql = require("./app/db/pgservice.js");

var host = process.env.HOST || appconfig.host;
var port = process.env.PORT || appconfig.port;

var org = configuration.getDefaultOrg();
var peer = configuration.getDefaultPeer();

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

var platforms = config["platforms"];

logger.info(
  "Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging."
);
startRestServices();

app.get("/api/status/:channel", function (req, res) {
  let channelName = req.params.channel;
  if (channelName) {
    statusMetrics.getStatus(channelName, function (data) {
      if (
        data &&
        (data.chaincodeCount &&
          data.txCount &&
          data.latestBlock &&
          data.peerCount)
      ) {
        return res.send(data);
      } else {
        return requtil.notFound(req, res);
      }
    });
  } else {
    return requtil.invalidRequest(req, res);
  }
});

/**
Return current channel
GET /api/curChannel
curl -i 'http://<host>:<port>/api/curChannel'
*/
app.get("/api/curChannel", function (req, res) {
  res.send({ currentChannel: configuration.getCurrChannel() });
});

/**
Return change channel
POST /api/changeChannel
curl -i 'http://<host>:<port>/api/curChannel'
*/
app.get("/api/changeChannel/:channelName", function (req, res) {
  let channelName = req.params.channelName;
  configuration.changeChannel(channelName);
  ledgerMgr.ledgerEvent.emit("changeLedger");
  res.send({ currentChannel: configuration.getCurrChannel() });
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
  let number = parseInt(req.params.number);
  let channelName = req.params.channel;
  if (!isNaN(number) && channelName) {
    sql
      .getRowByPkOne(
        `select blocknum ,txcount from blocks where channelname='${channelName}' and blocknum=${number} `
      )
      .then(row => {
        if (row) {
          return res.send({
            status: 200,
            number: row.blocknum,
            txCount: row.txcount
          });
        }
        return requtil.notFound(req, res);
      });
  } else {
    return requtil.invalidRequest(req, res);
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
  let txid = req.params.txid;
  let channelName = req.params.channel;
  if (txid && txid != "0" && channelName) {
    txModel.getTransactionByID(channelName, txid).then(row => {
      if (row) {
        return res.send({ status: 200, row });
      }
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    txModel.getTxList(channelName, blockNum, txid).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
    });
  } else {
    return requtil.invalidRequest(req, res);
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
  let channelName = req.params.channel;
  if (channelName) {
    statusMetrics.getPeerList(channelName, function (data) {
      res.send({ status: 200, peers: data });
    });
  } else {
    return requtil.invalidRequest(req, res);
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

app.get("/api/chaincode/:channel", function (req, res) {
  let channelName = req.params.channel;
  if (channelName) {
    statusMetrics.getTxPerChaincode(channelName, function (data) {
      res.send({ status: 200, chaincode: data });
    });
  } else {
    return requtil.invalidRequest(req, res);
  }
});

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
    blocksModel.getBlockAndTxList(channelName, blockNum).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    statusMetrics.getTxByMinute(channelName, hours).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    statusMetrics.getTxByHour(channelName, days).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    statusMetrics.getBlocksByMinute(channelName, hours).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    statusMetrics.getBlocksByHour(channelName, days).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
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
    statusMetrics.getTxByOrgs(channelName).then(rows => {
      if (rows) {
        return res.send({ status: 200, rows });
      }
      return requtil.notFound(req, res);
    });
  } else {
    return requtil.invalidRequest(req, res);
  }
});

/***
   Read "blockchain-explorer/app/config/CREATE-CHANNEL.md" on "how to create a channel"

    The values of the profile and genesisBlock are taken fron the configtx.yaml file that
    is used by the configtxgen tool
    Example values from the defualt first network:
    profile = 'TwoOrgsChannel';
    genesisBlock = 'TwoOrgsOrdererGenesis';
*/

/*
Create new channel
POST /api/channel
Content-Type : application/x-www-form-urlencoded
{channelName:"newchannel02"
genesisBlock:"TwoOrgsOrdererGenesis"
orgName:"Org1"
profile:"TwoOrgsChannel"}
{fieldname: "channelArtifacts", fieldname: "channelArtifacts"}
 <input type="file" name="channelArtifacts" multiple />
Response: {  success: true, message: "Successfully created channel "   }
*/

app.post('/api/channel', async function (req, res) {
  try {
    // upload channel config, and org config
    let artifacts = await chModel.aSyncUpload(req, res);
    if (artifacts) {
      if (artifacts.channelName && artifacts.profile && artifacts.genesisBlock) {
        // generate genesis block and channel transaction             //
        let channelGenesis = await chModel.generateChannelArtifacts(artifacts);
        artifacts.channelTxPath = channelGenesis.channelTxPath;
        try {
          let channelCreate = await chs.createChannel(artifacts);
          res.send(channelCreate)
        } catch (err) {
          res.send({ success: false, message: err })
        }
      } else {
        let response = {
          success: false,
          message: "Invalid request " + artifacts
        };
        return response;
      }
    } else {
      res.send({ success: false, message: 'no artifacts' })
    }

  } catch (err) {
    logger.error(err)
    return res.send({ success: false, message: "Invalid request, payload" });
  }
});

/***
    An API to join channel
POST /api/joinChannel

curl -X POST -H "Content-Type: application/json" -d '{ "orgName":"Org1","channelName":"newchannel"}' http://localhost:8080/api/joinChannel

Response: {  success: true, message: "Successfully joined peer to the channel "   }
*/

app.post("/api/joinChannel", function (req, res) {
  var channelName = req.body.channelName;
  var peers = req.body.peers;
  var orgName = req.body.orgName;
  if (channelName && peers && orgName) {
    chModel.joinChannel(channelName, peers, orgName).then(resp => {
      return res.send(resp);
    });
  } else {
    return requtil.invalidRequest(req, res);
  }
});

//============ web socket ==============//
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
wss.on("connection", function connection(ws, req) {
  const location = url.parse(req.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });
});

function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

async function startRestServices() {
  for (let pltfrm of platforms) {
    platform = await PlatformBuilder.build(pltfrm);

    timer.start(platform);

    /***
        Block by number
        GET /api/block/getinfo -> /api/block
        curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
        *
        */
    app.get("/api/block/:channel/:number", function (req, res) {
      let number = parseInt(req.params.number);
      let channelName = req.params.channel;
      if (!isNaN(number) && channelName) {
        platform.getBlockByNumber(channelName, number).then(block => {
          res.send({
            status: 200,
            number: block.header.number.toString(),
            previous_hash: block.header.previous_hash,
            data_hash: block.header.data_hash,
            transactions: block.data.data
          });
        });
      } else {
        return requtil.invalidRequest(req, res);
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

    app.get("/api/channels", function (req, res) {
      var channels = [],
        counter = 0;
      var channels = platform.getChannels();

      var response = { status: 200 };
      response["channels"] = [...new Set(channels)];
      res.send(response);
    });
  }
}

exports.wss = wss;
exports.broadcast = broadcast;
// ============= start server =======================
server.listen(port, function () {
  console.log(`Please open web browser to access ：http://${host}:${port}/`);
});

// this is for the unit testing
//module.exports = app;
