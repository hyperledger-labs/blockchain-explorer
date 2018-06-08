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
var requtil = require("./requestutils.js");
var logger = helper.getLogger("main");

var chModel = require("./app/platform/fabric/models/channel.js");
var chs = require("./app/platform/fabric/service/channelservice.js");
var url = require("url");
var WebSocket = require("ws");
var timer = require("./app/timer/timer.js");
var ledgerMgr = require("./app/utils/ledgerMgr.js");
var config = require("./appconfig.json");
var PlatformBuilder = require("./app/platform/PlatformBuilder.js");
var PersistanceFactory = require("./app/persistance/PersistanceFactory.js");
var dbroutes = require("./dbroutes.js");

app.use(express.static(path.join(__dirname, "client/build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var appconfig = require("./appconfig.json");

var host = process.env.HOST || appconfig.host;
var port = process.env.PORT || appconfig.port;


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

async function getPersistantStore() {

  persistance = await PersistanceFactory.create(config["persistance"]);
  dbroutes(app, persistance);
  startRestServices(persistance);

}

getPersistantStore();


logger.info(
  "Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging."
);


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

async function startRestServices(persistance) {
  for (let pltfrm of platforms) {
    platform = await PlatformBuilder.build(pltfrm);

    timer.start(platform, persistance);

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

    /**
    Return current channel
    GET /api/curChannel
    curl -i 'http://<host>:<port>/api/curChannel'
    */
    app.get("/api/curChannel", function (req, res) {
      res.send({ currentChannel: platform.getDefaultChannel() });
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
      res.send({ currentChannel: platform.getDefaultChannel() });
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
