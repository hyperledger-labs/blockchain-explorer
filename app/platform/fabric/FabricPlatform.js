/*
*SPDX-License-Identifier: Apache-2.0
*/

var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var helper = require('../../helper.js');
var logger = helper.getLogger('Query');
var configuration = require('./FabricConfiguration.js');
var FabricClientProxy = require('./FabricClientProxy.js');

class FabricPlatform {

		constructor() {
			this.peerFailures = 0;
			this.proxy = new FabricClientProxy();
			this.org = configuration.getDefaultOrg();
			this.peer = configuration.getDefaultPeer();
		}

		async initialize() {
            await this.proxy.createDefault();
		}

		queryChaincode(channelName, chaincodeName, fcn, args) {
			var channel = this.proxy.getChannel(channelName);
			var client = this.proxy.getClientForOrg(this.org);

			var target = this.proxy.buildTarget(this.peer, this.org);
			//Let Cahnnel use second peer added
			if (peerFailures > 0) {
				let peerToRemove = channel.getPeers()[0];
				channel.removePeer(peerToRemove);
				channel.addPeer(peerToRemove);
			}
			tx_id = client.newTransactionID();
			// send query
			var request = {
				chaincodeId: chaincodeName,
				txId: tx_id,
				fcn: fcn,
				args: args
			};
			return channel.queryByChaincode(request, target);
		}

		getBlockByNumber(channelName, blockNumber) {
			var target = this.proxy.buildTarget(this.peer, this.org);
			var channel = this.proxy.getChannel(channelName);
			return channel.queryBlock(parseInt(blockNumber), target).then((channelinfo) => {
				if (channelinfo) {
					return channelinfo;
				} else {
					logger.error('response_payloads is null');
					return 'response_payloads is null';
				}
			}, (err) => {
				logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
					err);
				return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
			}).catch((err) => {
				logger.error('Failed to query with error:' + err.stack ? err.stack : err);
				return 'Failed to query with error:' + err.stack ? err.stack : err;
			});
		};


		getTransactionByID(channelName, trxnID) {
			if (trxnID) {

			var target = this.proxy.buildTarget(this.peer, this.org);
			var channel = this.proxy.getChannel(channelName);
			return channel.queryTransaction(trxnID, target);
			}
			return {};

		}

		getBlockByHash(hash) {
			var target = this.proxy.buildTarget(this.peer, this.org);
			var channel = this.proxy.getChannelForOrg(this.org);
			return channel.queryBlockByHash(new Buffer(hash, "hex"), target);
		}

		getChainInfo(channelName) {
			var target = this.proxy.buildTarget(this.peer, this.org);
			var channel = this.proxy.getChannel(channelName);
			return channel.queryInfo(target, true).then((blockchainInfo) => {
				if (blockchainInfo) {
					// FIXME: Save this for testing 'getBlockByHash'  ?
					logger.debug('===========================================');
					logger.debug(blockchainInfo.currentBlockHash);
					logger.debug('===========================================');
					//logger.debug(blockchainInfo);
					return blockchainInfo;
				} else {
					logger.error('response_payloads is null');
					return 'response_payloads is null';
				}
			}, (err) => {
				logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
					err);
				return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
			}).catch((err) => {
				logger.error('Failed to query with error:' + err.stack ? err.stack : err);
				return 'Failed to query with error:' + err.stack ? err.stack : err;
			});
		}

		//getInstalledChaincodes
		getInstalledChaincodes(channelName, type) {
			var target = this.proxy.buildTarget(this.peer, this.org);
			var client = this.proxy.getClientForOrg(this.org);
			var channel = this.proxy.getChannel(channelName);
			return (function() {
				if (type === 'installed') {
					return client.queryInstalledChaincodes(target, true);
				} else {
					return channel.queryInstantiatedChaincodes(target, true);
				}
			}()).then((response) => {
				if (response) {
					if (type === 'installed') {
						logger.debug('<<< Installed Chaincodes >>>');
					} else {
						logger.debug('<<< Instantiated Chaincodes >>>');
					}
					var details = [];
					for (let i = 0; i < response.chaincodes.length; i++) {
						let detail = {}
						logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
							response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
						);
						detail.name = response.chaincodes[i].name
						detail.version = response.chaincodes[i].version
						detail.path = response.chaincodes[i].path
						details.push(detail);
					}
					return details;
				} else {
					logger.error('response is null');
					return 'response is null';
				}
			}, (err) => {
				logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
					err);
				return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
			}).catch((err) => {
				logger.error('Failed to query with error:' + err.stack ? err.stack : err);
				return 'Failed to query with error:' + err.stack ? err.stack : err;
			});
		}

		getOrganizations(channelName) {
			var channel = this.proxy.getChannel(channelName);
			return channel.getOrganizations();
		}

		getChannels() {
			return this.proxy.getChannels();
		}

		getConnectedPeers(channelName) {
			return this.proxy.getChannel(channelName).getPeers();
		}

		getChannelHeight(channelName) {
			return this.getChainInfo(channelName).then(response => {
				if (response) {
					logger.debug('<<<<<<<<<< channel height >>>>>>>>>')
					if (response.height.low) {
						logger.debug("response.height.low ", response.height.low);
						return response.height.low.toString()
					}
					return "0";
				}
			})
		}

		async syncChannelEventHubBlock(saveToDatabase) {

			var fabChannels = this.proxy.getChannelObjects();

			fabChannels.forEach( fabChannel => {
				var channel_event_hub = fabChannel.channelEventHub;

				channel_event_hub.connect(true);

				channel_event_hub.registerBlockEvent(
					async function (block) {
						console.log('Successfully received the block event' + block);
						if (block.data != undefined) {
							//full block

							try {
								saveToDatabase(block);
							} catch(err) {
								console.log(err.stack);
								logger.error(err)
							}
						} else {
							//filtered block
							console.log('The block number' + block.number);
							console.log('The filtered_tx' + block.filtered_tx);
							console.log('The block event channel_id' + block.channel_id);
						}
					},
					(error) => {
						console.log('Failed to receive the block event ::' + error);
					}
				);
			});
		}
}

module.exports = FabricPlatform;