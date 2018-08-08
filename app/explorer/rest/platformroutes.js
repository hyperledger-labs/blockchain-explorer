/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var ledgerMgr = require('./ledgerMgr');

var PlatformBuilder = require('../../platform/PlatformBuilder.js');

var requtil = require('./requestutils');
var helper = require('../../helper.js');
var chs = require('../../explorer/rest/logical/channelService.js');
var logger = helper.getLogger('main');

const platformroutes = async function(app, pltfrm, persistence) {
  platform = await PlatformBuilder.build(pltfrm);
  proxy = platform.getDefaultProxy();
  statusMetrics = persistence.getMetricService();
  crudService = persistence.getCrudService();

  /***
      Block by number
      GET /api/block/getinfo -> /api/block
      curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
      *
      */
  app.get('/api/block/:channel_genesis_hash/:number', function(req, res) {
    let number = parseInt(req.params.number);
    let channel_genesis_hash = req.params.channel_genesis_hash;

    if (!isNaN(number) && channel_genesis_hash) {
      proxy.getBlockByNumber(channel_genesis_hash, number).then(block => {
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

  app.get('/api/channels', function(req, res) {
    var channels = [],
      counter = 0;
    var channels = platform.getChannels();

    var response = {
      status: 200
    };
    response['channels'] = [...new Set(channels)];
    res.send(response);
  });

  /**
  Return current channel
  GET /api/curChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/curChannel', function(req, res) {
    this.proxy.getGenesisBlockHash().then(data => {
      res.send({
        currentChannel: data
      });
    });
  });

  /**
  Return change channel
  POST /api/changeChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/changeChannel/:channel_genesis_hash', async function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let channel = await this.crudService.getChannelByGenesisBlockHash(
      channel_genesis_hash
    );
    proxy.changeChannel(channel.name);
    ledgerMgr.ledgerEvent.emit('changeLedger');
    let curChannel = await this.proxy.getGenesisBlockHash(channel.name);
    res.send({
      currentChannel: curChannel
    });
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

  app.post('/api/channel', async function(req, res) {
    try {
      // upload channel config, and org config
      let artifacts = await requtil.aSyncUpload(req, res);
      let chCreate = await chs.createChannel(artifacts, platform, crudService);
      let channelResponse = {
        success: chCreate.success,
        message: chCreate.message
      };
      return res.send(channelResponse);
    } catch (err) {
      logger.error(err);
      let channelError = {
        success: false,
        message: 'Invalid request, payload'
      };
      return res.send(channelError);
    }
  });

  /***
      An API to join channel
  POST /api/joinChannel

  curl -X POST -H "Content-Type: application/json" -d '{ "orgName":"Org1","channelName":"newchannel"}' http://localhost:8080/api/joinChannel

  Response: {  success: true, message: "Successfully joined peer to the channel "   }
  */

  app.post('/api/joinChannel', function(req, res) {
    var channelName = req.body.channelName;
    var peers = req.body.peers;
    var orgName = req.body.orgName;
    if (channelName && peers && orgName) {
      proxy.joinChannel(channelName, peers, orgName, platform).then(resp => {
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

  app.get('/api/chaincode/:channel', function(req, res) {
    let channelName = req.params.channel;
    if (channelName) {
      statusMetrics.getTxPerChaincode(channelName, async function(data) {
        for (let chaincode of data) {
          let temp = await proxy.loadChaincodeSrc(chaincode.path);
          chaincode.source = temp;
        }
        res.send({
          status: 200,
          chaincode: data
        });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /***Peer Status List
  GET /peerlist -> /api/peersStatus
  curl -i 'http://<host>:<port>/api/peersStatus/<channel>'
  Response:
  [
    {
      "requests": "grpcs://127.0.0.1:7051",
      "server_hostname": "peer0.org1.example.com"
    }
  ]
  */

  app.get('/api/peersStatus/:channel', function(req, res) {
    let channelName = req.params.channel;
    if (channelName) {
      platform.getPeersStatus(channelName, function(data) {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });
};

module.exports = platformroutes;
