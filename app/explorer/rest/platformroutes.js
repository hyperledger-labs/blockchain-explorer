/**
*    SPDX-License-Identifier: Apache-2.0
*/
var ledgerMgr = require("./ledgerMgr");

var PlatformBuilder = require("../../platform/PlatformBuilder.js");

var requtil = require("./requestutils");
var helper=require('../../helper.js')
var logger = helper.getLogger("main");

var chModel = require("../../platform/fabric/models/channel.js");
var chs = require("../../platform/fabric/service/channelservice.js");


const platformroutes = async function(app, pltfrm, persistance) {

      platform = await PlatformBuilder.build(pltfrm);
      proxy = platform.getDefaultProxy();
      statusMetrics = persistance.getMetricService();

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
          proxy.getBlockByNumber(channelName, number).then(block => {
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
          res.send({ currentChannel: proxy.getDefaultChannel() });
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
          res.send({ currentChannel: proxy.getDefaultChannel() });
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
              statusMetrics.getTxPerChaincode(channelName, async function (data) {
                 for (let chaincode of data) {
                   let temp = await proxy.loadChaincodeSrc(chaincode.path);
                   chaincode.source = temp;
                 }
                 res.send({ status: 200, chaincode: data });
               });
            } else {
               return requtil.invalidRequest(req, res);
            }
        });
}

module.exports = platformroutes;