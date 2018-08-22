/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var requtil = require('./requestutils.js');
const dbroutes = (app, persist) => {
  var statusMetrics = persist.getMetricService();
  var crudService = persist.getCrudService();

  app.get('/api/status/:channel_genesis_hash', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      statusMetrics.getStatus(channel_genesis_hash, function(data) {
        if (data && (data.chaincodeCount && data.txCount && data.peerCount)) {
          return res.send(data);
        } else {
          return requtil.notFound(req, res);
        }
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /***
  Transaction count
  GET /api/block/get -> /api/block/transactions/
  curl -i 'http://<host>:<port>/api/block/transactions/<channel_genesis_hash>/<number>'
  Response:
  {
    "number": 2,
    "txCount": 1
  }
  */
  app.get(
    '/api/block/transactions/:channel_genesis_hash/:number',
    async function(req, res) {
      let number = parseInt(req.params.number);
      let channel_genesis_hash = req.params.channel_genesis_hash;
      if (!isNaN(number) && channel_genesis_hash) {
        var row = await crudService.getTxCountByBlockNum(
          channel_genesis_hash,
          number
        );
        if (row) {
          return res.send({
            status: 200,
            number: row.blocknum,
            txCount: row.txcount
          });
        }
        return requtil.notFound(req, res);
      } else {
        return requtil.invalidRequest(req, res);
      }
    }
  );

  //
  /***
  Transaction Information
  GET /api/tx/getinfo -> /api/transaction/<txid>
  curl -i 'http://<host>:<port>/api/transaction/<channel_genesis_hash>/<txid>'
  Response:
  {
    "tx_id": "header.channel_header.tx_id",
    "timestamp": "header.channel_header.timestamp",
    "channel_id": "header.channel_header.channel_id",
    "type": "header.channel_header.type"
  }
  */

  app.get('/api/transaction/:channel_genesis_hash/:txid', function(req, res) {
    let txid = req.params.txid;
    let channel_genesis_hash = req.params.channel_genesis_hash;
    if (txid && txid != '0' && channel_genesis_hash) {
      crudService.getTransactionByID(channel_genesis_hash, txid).then(row => {
        if (row) {
          row.createdt = new Date(row.createdt).toISOString();
          return res.send({ status: 200, row });
        }
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  app.get('/api/blockActivity/:channel_genesis_hash', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      crudService.getBlockActivityList(channel_genesis_hash).then(row => {
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
  curl -i 'http://<host>:<port>/api/txList/<channel_genesis_hash>/<blocknum>/<txid>/<limitrows>/<offset>'
  Response:
  {"rows":[{"id":56,"channelname":"mychannel","blockid":24,
  "txhash":"c42c4346f44259628e70d52c672d6717d36971a383f18f83b118aaff7f4349b8",
  "createdt":"2018-03-09T19:40:59.000Z","chaincodename":"mycc"}]}
  */
  app.get('/api/txList/:channel_genesis_hash/:blocknum/:txid', async function(
    req,
    res
  ) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let blockNum = parseInt(req.params.blocknum);
    let txid = parseInt(req.params.txid);
    let orgs = requtil.orgsArrayToString(req.query.orgs);
    let { from, to } = requtil.queryDatevalidator(req.query.from, req.query.to);
    if (isNaN(txid)) {
      txid = 0;
    }
    if (channel_genesis_hash) {
      crudService
        .getTxList(channel_genesis_hash, blockNum, txid, from, to, orgs)
        .then(rows => {
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
  curl -i 'http://<host>:<port>/api/peers/<channel_genesis_hash>'
  Response:
  [
    {
      "requests": "grpcs://127.0.0.1:7051",
      "server_hostname": "peer0.org1.example.com"
    }
  ]
  */
  app.get('/api/peers/:channel_genesis_hash', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      statusMetrics.getPeerList(channel_genesis_hash, function(data) {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /***
   List of blocks and transaction list per block
  GET /api/blockAndTxList
  curl -i 'http://<host>:<port>/api/blockAndTxList/channel_genesis_hash/<blockNum>/<limitrows>/<offset>'
  Response:
  {"rows":[{"id":51,"blocknum":50,"datahash":"374cceda1c795e95fc31af8f137feec8ab6527b5d6c85017dd8088a456a68dee",
  "prehash":"16e76ca38975df7a44d2668091e0d3f05758d6fbd0aab76af39f45ad48a9c295","channelname":"mychannel","txcount":1,
  "createdt":"2018-03-13T15:58:45.000Z","txhash":["6740fb70ed58d5f9c851550e092d08b5e7319b526b5980a984b16bd4934b87ac"]}]}
  *
  */

  app.get('/api/blockAndTxList/:channel_genesis_hash/:blocknum', async function(
    req,
    res
  ) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let blockNum = parseInt(req.params.blocknum);
    let orgs = requtil.orgsArrayToString(req.query.orgs);
    let { from, to } = requtil.queryDatevalidator(req.query.from, req.query.to);
    if (channel_genesis_hash && !isNaN(blockNum)) {
      crudService
        .getBlockAndTxList(channel_genesis_hash, blockNum, from, to, orgs)
        .then(rows => {
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
  curl -i 'http://<host>:<port>/api/txByMinute/<channel_genesis_hash>/<hours>'
  Response:
  {"rows":[{"datetime":"2018-03-13T17:46:00.000Z","count":"0"},{"datetime":"2018-03-13T17:47:00.000Z","count":"0"},{"datetime":"2018-03-13T17:48:00.000Z","count":"0"},{"datetime":"2018-03-13T17:49:00.000Z","count":"0"},{"datetime":"2018-03-13T17:50:00.000Z","count":"0"},{"datetime":"2018-03-13T17:51:00.000Z","count":"0"},
  {"datetime":"2018-03-13T17:52:00.000Z","count":"0"},{"datetime":"2018-03-13T17:53:00.000Z","count":"0"}]}

  */

  app.get('/api/txByMinute/:channel_genesis_hash/:hours', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let hours = parseInt(req.params.hours);

    if (channel_genesis_hash && !isNaN(hours)) {
      statusMetrics.getTxByMinute(channel_genesis_hash, hours).then(rows => {
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
  curl -i 'http://<host>:<port>/api/txByHour/<channel_genesis_hash>/<days>'
  Response:
  {"rows":[{"datetime":"2018-03-12T19:00:00.000Z","count":"0"},
  {"datetime":"2018-03-12T20:00:00.000Z","count":"0"}]}
  */

  app.get('/api/txByHour/:channel_genesis_hash/:days', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let days = parseInt(req.params.days);

    if (channel_genesis_hash && !isNaN(days)) {
      statusMetrics.getTxByHour(channel_genesis_hash, days).then(rows => {
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
  curl -i 'http://<host>:<port>/api/blocksByMinute/<channel_genesis_hash>/<hours>'
  Response:
  {"rows":[{"datetime":"2018-03-13T19:59:00.000Z","count":"0"}]}

  */

  app.get('/api/blocksByMinute/:channel_genesis_hash/:hours', function(
    req,
    res
  ) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let hours = parseInt(req.params.hours);

    if (channel_genesis_hash && !isNaN(hours)) {
      statusMetrics
        .getBlocksByMinute(channel_genesis_hash, hours)
        .then(rows => {
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
  curl -i 'http://<host>:<port>/api/blocksByHour/<channel_genesis_hash>/<days>'
  Response:
  {"rows":[{"datetime":"2018-03-13T20:00:00.000Z","count":"0"}]}

  */

  app.get('/api/blocksByHour/:channel_genesis_hash/:days', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;
    let days = parseInt(req.params.days);

    if (channel_genesis_hash && !isNaN(days)) {
      statusMetrics.getBlocksByHour(channel_genesis_hash, days).then(rows => {
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
  curl -i 'http://<host>:<port>/api/txByOrg/<channel_genesis_hash>'
  Response:
  {"rows":[{"count":"4","creator_msp_id":"Org1"}]}

  */
  app.get('/api/txByOrg/:channel_genesis_hash', function(req, res) {
    let channel_genesis_hash = req.params.channel_genesis_hash;

    if (channel_genesis_hash) {
      statusMetrics.getTxByOrgs(channel_genesis_hash).then(rows => {
        if (rows) {
          return res.send({ status: 200, rows });
        }
        return requtil.notFound(req, res);
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
          Channels
          GET /channels -> /api/channels/info
          curl -i 'http://<host>:<port>/api/channels/<info>'
          Response:
          [
            {
              "channelName": "mychannel",
              "channel_hash": "",
              "craetedat": "1/1/2018"
            }
          ]
        */

  app.get('/api/channels/info', function(req, res) {
    crudService
      .getChannelsInfo()
      .then(data => {
        data.forEach(element => {
          element.createdat = new Date(element.createdat).toISOString();
        });
        res.send({ status: 200, channels: data });
      })
      .catch(err => res.send({ status: 500 }));
  });
};

module.exports = dbroutes;
