/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const requtil = require('./requestutils');

const platformroutes = async function (app, platform) {
  const proxy = platform.getProxy();
  const statusMetrics = platform.getPersistence().getMetricService();
  const crudService = platform.getPersistence().getCrudService();

  /** *
      Block by number
      GET /api/block/getinfo -> /api/block
      curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
      *
      */
  app.get('/api/block/:channel_genesis_hash/:number', (req, res) => {
    const number = parseInt(req.params.number);
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (!isNaN(number) && channel_genesis_hash) {
      proxy.getBlockByNumber(channel_genesis_hash, number).then((block) => {
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
      'channels': [
          {
          'channel_id': 'mychannel'
          }
      ]
      }
      */

  app.get('/api/channels', (req, res) => {
    proxy.getChannels().then((channels) => {
      const response = {
        status: 200
      };
      response.channels = channels;
      res.send(response);
    });
  });

  /**
  Return current channel
  GET /api/curChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/curChannel', (req, res) => {
    proxy.getCurrentChannel().then((data) => {
      res.send(data);
    });
  });

  /**
  Return change channel
  POST /api/changeChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/changeChannel/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    proxy.changeChannel(channel_genesis_hash).then((data) => {
      res.send({
        currentChannel: data
      });
    });
  });

  /** *
     Read 'blockchain-explorer/app/config/CREATE-CHANNEL.md' on 'how to create a channel'

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
  {channelName:'newchannel02'
  genesisBlock:'TwoOrgsOrdererGenesis'
  orgName:'Org1'
  profile:'TwoOrgsChannel'}
  {fieldname: 'channelArtifacts', fieldname: 'channelArtifacts'}
  <input type='file' name='channelArtifacts' multiple />
  Response: {  success: true, message: 'Successfully created channel '   }
  */

  app.post('/api/channel', async (req, res) => {
    try {
      // upload channel config, and org config
      const artifacts = await requtil.aSyncUpload(req, res);
      const chCreate = await proxy.createChannel(artifacts);
      const channelResponse = {
        success: chCreate.success,
        message: chCreate.message
      };
      return res.send(channelResponse);
    } catch (err) {
      logger.error(err);
      const channelError = {
        success: false,
        message: 'Invalid request, payload'
      };
      return res.send(channelError);
    }
  });

  /** *
      An API to join channel
  POST /api/joinChannel

  curl -X POST -H 'Content-Type: application/json' -d '{ 'orgName':'Org1','channelName':'newchannel'}' http://localhost:8080/api/joinChannel

  Response: {  success: true, message: 'Successfully joined peer to the channel '   }
  */

  app.post('/api/joinChannel', (req, res) => {
    const channelName = req.body.channelName;
    const peers = req.body.peers;
    const orgName = req.body.orgName;
    if (channelName && peers && orgName) {
      proxy
        .joinChannel(channelName, peers, orgName)
        .then(resp => res.send(resp));
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
          'channelName': 'mychannel',
          'chaincodename': 'mycc',
          'path': 'github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02',
          'version': '1.0',
          'txCount': 0
        }
      ]
    */

  app.get('/api/chaincode/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      statusMetrics.getTxPerChaincode(channelName, async (data) => {
        for (const chaincode of data) {
          const temp = await proxy.loadChaincodeSrc(chaincode.path);
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

  /** *Peer Status List
  GET /peerlist -> /api/peersStatus
  curl -i 'http://<host>:<port>/api/peersStatus/<channel>'
  Response:
  [
    {
      'requests': 'grpcs://127.0.0.1:7051',
      'server_hostname': 'peer0.org1.example.com'
    }
  ]
  */

  app.get('/api/peersStatus/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      proxy.getPeersStatus(channelName).then((data) => {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });
};

module.exports = platformroutes;
