/*Copyright DTCC 2016 All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
//"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = process.env.PROC_NAME || 'HyperlegerExplorer';

// Port where we'll run the websocket server
var webSocketsServerPort = process.env.HTTP_PORT || 9090;

var express = require('express');
var app = express();
app.use(express.static(__dirname+'/webcontent/static/scripts'));
app.use(express.static(__dirname+'/webcontent/static/css'));
app.use(express.static(__dirname+'/webcontent/static/images'));
app.use(express.static(__dirname+'/webcontent/static/scripts/socket.io-client'));
app.use(express.static(__dirname+'/webcontent/static/scripts/angular'));
app.use(express.static(__dirname+'/webcontent/static/scripts/angular-animate'));

var peerIntf = require('./hyperledgerpeerintf');



//var dots = require("dot").process({ path: "./views"});
require("dot").process({
	templateSettings : {
	  evaluate:    /\(\(([\s\S]+?)\)\)/g,
	  interpolate: /\(\(=([\s\S]+?)\)\)/g,
	  encode:      /\(\(!([\s\S]+?)\)\)/g,
	  use:         /\(\(#([\s\S]+?)\)\)/g,
	  define:      /\(\(##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\)\)/g,
	  conditional: /\(\(\?(\?)?\s*([\s\S]*?)\s*\)\)/g,
	  iterate:     /\(\(~\s*(?:\)\)|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\)\))/g,
	  varname: 'it',
	  strip: true,
	  append: true,
	  selfcontained: false
	}
	,global: "_page.render"
	, destination: __dirname + "/webcontent/dynamic/"
	, path: (__dirname + "/templates")
});

var render = require( __dirname + "/webcontent/dynamic/");

//Hyperledger UI
var ledgerData = { "chain" : { "height" : 0} , "peers" : {} , "blocks" : []};
var statsData = null;
app.get("/", function(req, res) {

	try {
		var ledgerDataStr = JSON.stringify(ledgerData);
		var statsDataStr = JSON.stringify(statsData);
		res.send(render.HyperlegerExplorer({'ledgerData' : ledgerDataStr , 'statsData':statsDataStr}));
	} catch(e) {
		console.log(" Error retrieving initial hyperledger info "+e);
		return res.send(render.HyperlegerExplorer(0));
	}


});

app.get('/block/:blockNum', function(req, res) {
	try {
		var blockNum =  req.params.blockNum.substring(1);
		console.log('block Num requested ',blockNum);
		peerIntf.block(blockNum, function (obj) {
			res.send(obj);
		});
	} catch(e) {
		res.send({});
	}
});

var locked = false;
var initial = true;
var getLedgerInfo = function(callBk) {
	if(locked) {
		console.log('Waiting to retrieve ledger data ...');
		setTimeout(function(){ getLedgerInfo(callBk);}, 1000);
		return;
	}
	try {
		var currHeight = ledgerData.chain.height;
		peerIntf.chain(
			function(obj) {
				ledgerData.chain = obj;
				peerIntf.peers(
					function(obj) {
						ledgerData.peers = obj;
						//console.log('height : '+ledgerData.chain.height);
						if(initial) {
							var start = 0;
							if (ledgerData.chain.height > 100)
								start = ledgerData.chain.height - 99;
							//dont load all the blocks. only the latest 100.
							for (var i = 0; i < start; i++)
								ledgerData.blocks.push(null);
							currHeight = start;
							initial = false;
						}
						//console.log('loading ',currHeight);
						var blockFunc = function(obj) {
							ledgerData.blocks.push(obj);
							if(ledgerData.blocks.length > 100) {
								ledgerData.blocks[ledgerData.blocks.length - 101] = null;
							}
							currHeight = ledgerData.blocks.length;
							if(currHeight == ledgerData.chain.height) {
								callBk(ledgerData);
								locked = false;
							} else
								peerIntf.block((currHeight++),blockFunc);
						}
						if(currHeight != ledgerData.chain.height)
							peerIntf.block(currHeight,blockFunc);

					}
				)
			}
		);
	} catch(e) {
		console.log(e);
		locked = false;
		throw e;
	}
}

var newBlockArrived = true; //initial value is true

//initial load
getLedgerInfo( function () {
	try {
		//console.log('Ledger data retrieved.');
		//start listener and Web sockets for updates
		var server = require('http').createServer(app);
		var io = require('socket.io')(server);
		setInterval(
			function() {
				var prevPeers = ledgerData.peers;
				var prevHeight = ledgerData.chain.height;
				var newData = {};
				getLedgerInfo( function() {
					if(JSON.stringify(prevPeers) != JSON.stringify(ledgerData.peers))
						newData.peers = ledgerData.peers;
					if(prevHeight != ledgerData.chain.height) {
						newData.chain = ledgerData.chain;
						newBlocks = new Array();
						for(var i = prevHeight; i < ledgerData.chain.height; i++)
							newBlocks.push(ledgerData.blocks[i]);
						newData.blocks = newBlocks;
					}
					if(newData.peers || newData.blocks) {
						io.emit('update', JSON.stringify(newData));
						newBlockArrived= true;
					}
				});
			}
			, 2000);
		setInterval(
			function() {
				if(!newBlockArrived)
					return;
				newBlockArrived = false;
				var endSecs = -1;
				var txnRate = 0;
				var blkRate = 0;
				var txnCount = 0;
				var txnLatency = 0;
				var currTime;
				var blkTxGraph = {
					block : [],
					txs: []
				}
				var txRateGraph = {"time":[],"txRate":[]}
				var blkRateGraph = {"time":[],"blkRate":[]}
				statsData = {
					"checkTime" : "",
					"avgTxnLatency" : "",
					"txnRate": "",
					"mineRate": "",
					"txRateGraph":txRateGraph,
					"blkRateGraph":blkRateGraph
				};

				for (var i = ledgerData.chain.height - 1; i > 0; i--) {
					if(txRateGraph.time.length == 20)
						break;
					var block = ledgerData.blocks[i];
					if (!block || !block.nonHashData)
						continue;

					if (blkTxGraph.block.length < 20) {
						blkTxGraph.block.push(i);
						blkTxGraph.txs.push(block.transactions.length);
					}
					if (endSecs < 0) {
						endSecs = block.nonHashData.localLedgerCommitTimestamp.seconds;
						currTime = new Date(null);
						currTime.setSeconds(endSecs);
						currTime = currTime.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
					}
					if (block.nonHashData.localLedgerCommitTimestamp.seconds >= (endSecs - 10)) {
						blkRate++;
						for (var k = 0; k < block.transactions.length; k++) {
							txnRate++;
							txnCount++;
							txnLatency += (block.nonHashData.localLedgerCommitTimestamp.seconds - block.transactions[k].timestamp.seconds);
						}
					} else {
						//console.log("new row " , txRateGraph.time.length);
						txnRate = Math.round(txnRate/10);
						blkRate = Math.round(blkRate/10);

						statsData = {
							"checkTime" : currTime,
							"avgTxnLatency" : Math.round((txnLatency/txnCount)*1000),
							"txnRate": txnRate,
							"mineRate": blkRate
						}


						txRateGraph.time. push( currTime);
						txRateGraph.txRate. push( txnRate);

						blkRateGraph.time. push( currTime);
						blkRateGraph.blkRate. push( blkRate);

						endSecs = -1;
						txnRate = 0;
						blkRate = 0;
						txnCount = 0;
						txnLatency = 0;
					}

				}

				statsData = {
					"checkTime" : statsData.checkTime,
					"avgTxnLatency" : statsData.avgTxnLatency,
					"txnRate": statsData.txnRate,
					"mineRate": statsData.mineRate,
					"txRateGraph":txRateGraph,
					"blkRateGraph":blkRateGraph
				}

				statsData.txRateGraph = { "time" : txRateGraph.time.reverse() , "txRate" :txRateGraph.txRate.reverse() };
				statsData.blkRateGraph = { "time" : blkRateGraph.time.reverse() , "blkRate" : blkRateGraph.blkRate.reverse() };
				statsData.blkTxGraph = { "block" : blkTxGraph.block.reverse() , "txs" : blkTxGraph.txs.reverse() };
				//simulated values for now. Will be fixed soon.
				var x = Math.floor(Math.random() * 95) + 76,y=Math.floor(Math.random() * 106) + 91,z=Math.floor(Math.random() * 64) + 37
				statsData.chTx = { "chainCodes" : ["ch01","ch02","ch03"] , "counts": [x,y,z] };
				var x= Math.floor(Math.random() * 834) + 631,y=Math.floor(Math.random() * 232) + 46,z=Math.floor(Math.random() * 56) + 32
				statsData.apprTx = { "stats" : ["Approved","Pending","Rejected"] , "counts": [x,y,z] };

				console.log(' statsData ',statsData);
				io.emit('stats',JSON.stringify(statsData));
			}
			, 5000);
		server.listen(webSocketsServerPort);
	} catch(e) {
		console.log('Ledger data initialization failed.');
		exit(-1);
	}
});
