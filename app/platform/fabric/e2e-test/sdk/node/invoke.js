/**
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const hfc = require('fabric-client');
const { Gateway, InMemoryWallet, X509WalletMixin } = require('fabric-network');
const common = require('./common.js');
const client = new hfc();

/**
 * Perform an "invoke" action on installed/instantiated chaincode
 * @param {String} inputFilePath the file path containing test run information as a JSON object containing
 * {
 *  username: the test user name
 *  org: the organisation to use
 *  chaincode: object describing the chaincode parameters
 *  orderer: the orderer to use
 *  networkConfigFile: the network configuration file path
 *  opts: additional test parameters
 * }
 */
function invoke(inputFilePath) {
	const filePath = path.join(__dirname, inputFilePath);
	const inputData = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

	const temptext =
		'\n\n Username : ' +
		inputData.user +
		'\n\n Org: ' +
		inputData.org +
		'\n\n OrgName: ' +
		inputData.orgName +
		'\n\n chaincode : ' +
		util.format(inputData.chaincode) +
		'\n\n peerNames : ' +
		inputData.peers +
		'\n\n orderer: ' +
		inputData.orderer +
		'\n\n network_config_path: ' +
		inputData.networkConfigFile +
		'\n\n opts: ' +
		util.format(inputData.opts);
	//console.log(temptext);

	// Read Network JSON PATH from behave
	let network_config;
	try {
		network_config = JSON.parse(fs.readFileSync(inputData.networkConfigFile));
	} catch (err) {
		console.error(err);
	}

	// Node SDK implements transaction as well as invoke, disambiguate on the passed opts
	if (
		inputData.opts &&
		inputData.opts['network-model'] &&
		inputData.opts['network-model'].localeCompare('true') === 0
	) {
		return _submitTransaction(
			inputData.orgName,
			inputData.chaincode,
			network_config
		);
	} else {
		return _invoke(
			inputData.user,
			inputData.org,
			inputData.orgName,
			inputData.chaincode,
			inputData.peers,
			inputData.orderer,
			network_config
		);
	}
}

/**
 * Perform an invoke using the NodeSDK
 * @param {Strinrg} username the user name to perform the action under
 * @param {String} org the organisation to use
 * @param {String} orgName the organisation name
 * @param {JSON} chaincode the chaincode descriptor
 * @param {[String]} peerNames string array of peers
 * @param {String} orderer the orderer
 * @param {JSON} network_config the network configuration
 */
function _invoke(
	username,
	org,
	orgName,
	chaincode,
	peerNames,
	orderer,
	network_config
) {
	let channel;

	let targets = peerNames
		? common.newPeers(
				peerNames,
				orgName,
				network_config['network-config'],
				client
		  )
		: undefined;

	const user = username.split('@')[1] ? username : username + '@' + org;
	const userOrg = username.split('@')[1] ? username.split('@')[1] : org;

	let tx_id = null;
	return common
		.getRegisteredUsers(
			client,
			user,
			userOrg,
			network_config['networkID'],
			network_config['network-config'][orgName]['mspid']
		)
		.then(
			user => {
				tx_id = client.newTransactionID();

				channel = client.newChannel(chaincode.channelId);
				channel.addOrderer(
					common.newOrderer(
						client,
						network_config['network-config'],
						orderer,
						network_config['tls']
					)
				);
				common.setupPeers(
					peerNames,
					channel,
					orgName,
					client,
					network_config['network-config'],
					network_config['tls']
				);

				// send proposal to endorser
				let request = {
					chaincodeId: chaincode.chaincodeId,
					fcn: chaincode.fcn,
					args: chaincode.args,
					chainId: chaincode.channelId,
					txId: tx_id
				};

				if (targets) {
					request.targets = targets;
				}

				console.info(JSON.stringify(['ok', 'request is set']));
				return channel.sendTransactionProposal(request, 120000);
			},
			err => {
				console.error("Failed to enroll user '" + username + "'. " + err);
				throw new Error("Failed to enroll user '" + username + "'. " + err);
			}
		)
		.then(
			results => {
				console.info(JSON.stringify(['ok', 'proposal sent']));
				let proposalResponses = results[0];
				let proposal = results[1];
				let all_good = true;
				for (var i in proposalResponses) {
					let one_good = false;
					if (
						proposalResponses &&
						proposalResponses[i].response &&
						proposalResponses[i].response.status === 200
					) {
						one_good = true;
					} else {
						console.error('transaction proposal was bad');
					}
					all_good = all_good & one_good;
				}
				if (all_good) {
					var request = {
						proposalResponses: proposalResponses,
						proposal: proposal
					};
					// set the transaction listener and set a timeout of 30sec
					// if the transaction did not get committed within the timeout period,
					// fail the test
					let eventPromises = [];

					if (!peerNames) {
						peerNames = channel.getPeers().map(function(peer) {
							return peer.getName();
						});
					}

					let sendPromise = channel.sendTransaction(request);
					return Promise.all([sendPromise].concat(eventPromises))
						.then(results => {
							return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
						})
						.catch(err => {
							console.error(
								JSON.stringify([
									'error',
									'Failed to send transaction and get notifications within the timeout period.'
								])
							);
							return 'Failed to send transaction and get notifications within the timeout period.';
						});
				} else {
					console.error(
						'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
					);
					return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
				}
			},
			err => {
				console.error(
					'Failed to send proposal due to error: ' + err.stack ? err.stack : err
				);
				return 'Failed to send proposal due to error: ' + err.stack
					? err.stack
					: err;
			}
		)
		.then(
			response => {
				if (response.status === 'SUCCESS') {
					var jsonResponse = ['ok', tx_id.getTransactionID().toString()];
					console.info(JSON.stringify(jsonResponse));
					return JSON.stringify(jsonResponse);
				} else {
					console.error(
						JSON.stringify([
							'ok',
							'Failed to order the transaction. Error code: ' + response
						])
					);
					return 'Failed to order the transaction. Error code: ' + response.status;
				}
			},
			err => {
				console.error(
					'Failed to send transaction due to error: ' + err.stack ? err.stack : err
				);
				return 'Failed to send transaction due to error: ' + err.stack
					? err.stack
					: err;
			}
		);
}

/**
 * Perform a transaction invoke using the network APIs
 * @param {String} org the organisation to use
 * @param {JSON} chaincode the chaincode descriptor
 * @param {JSON} network_config the network configuration
 */
async function _submitTransaction(org, chaincode, network_config) {
	const ccp = network_config['common-connection-profile'];
	const orgConfig = ccp.organizations[org];
	const cert = common.readAllFiles(orgConfig.signedCertPEM)[0];
	const key = common.readAllFiles(orgConfig.adminPrivateKeyPEM)[0];
	const inMemoryWallet = new InMemoryWallet();

	const gateway = new Gateway();

	try {
		await inMemoryWallet.import(
			'admin',
			X509WalletMixin.createIdentity(orgConfig.mspid, cert, key)
		);

		const opts = {
			wallet: inMemoryWallet,
			identity: 'admin',
			discovery: { enabled: false }
		};

		await gateway.connect(
			ccp,
			opts
		);

		const network = await gateway.getNetwork(chaincode.channelId);
		const contract = await network.getContract(chaincode.chaincodeId);

		const args = [chaincode.fcn, ...chaincode.args];
		const result = await contract.submitTransaction(...args);

		gateway.disconnect();
		return result;
	} catch (err) {
		throw new Error(err);
	}
}

exports.invoke = invoke;
require('make-runnable');

// Example test calls
// node invoke.js invoke User1@org1.example.com Org1ExampleCom '{"channelId": "behavesystest", "args": ["a", "b", "10"], "chaincodeId": "mycc", "name": "mycc", "fcn": "invoke"}' ['peer0.org1.example.com'] orderer0.example.com /Users/nkl/go/src/github.com/hyperledger/fabric-test/feature/configs/0be5908ac30011e88d70acbc32c08695/network-config.json '{"transaction": "true"}'
// node invoke.js invoke User1@org1.example.com Org1ExampleCom '{"channelId": "behavesystest", "args": ["a", "b", "10"], "chaincodeId": "mycc", "name": "mycc", "fcn": "invoke"}' ['peer0.org1.example.com'] orderer0.example.com /Users/nkl/go/src/github.com/hyperledger/fabric-test/feature/configs/4fe4f54cc62411e8977eacbc32c08695/network-config.json '{"transaction": "true"}'
