/**
*    SPDX-License-Identifier: Apache-2.0
*/

var requtil = require("./requestutils.js");

const dbroutes = (app, persist) => {

  var statusMetrics = persist.getMetricService();
  var crudService = persist.getCrudService();

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
  app.get("/api/block/transactions/:channel/:number", async function (req, res) {
    let number = parseInt(req.params.number);
    let channelName = req.params.channel;
    if (!isNaN(number) && channelName) {
        var row = await crudService.getTxCountByBlockNum(channelName,number);
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
        crudService.getTransactionByID(channelName, txid).then(row => {
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
      crudService.getTxList(channelName, blockNum, txid).then(rows => {
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
      crudService.getBlockAndTxList(channelName, blockNum).then(rows => {
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


}

module.exports = dbroutes;