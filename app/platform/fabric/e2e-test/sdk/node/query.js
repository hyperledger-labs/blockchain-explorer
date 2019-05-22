/**
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const common = require('./common.js');
const { Gateway, InMemoryWallet, X509WalletMixin } = require('fabric-network');
const Client = require('fabric-client');
let client = new Client();

/**
 * Perform a query using installed/instantiated chaincode
 * @param {String} inputFilePath the file path containing test run information as a JSON object containing
 * {
 *  username: the test user name
 *  org: the organisation to use
 *  chaincode: object describing the chaincode parameters
 *  peer: array of the peers to use
 *  networkConfigFile: the network configuration file path
 *  opts: additional test parameters
 * }
 */
function query(inputFilePath) {
	const filePath = path.join(__dirname, inputFilePath);
	const inputData = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

	const temptext =
		'\n\n user : ' +
		inputData.user +
		'\n\n Org: ' +
		inputData.org +
		'\n\n OrgName: ' +
		inputData.orgName +
		'\n\n chaincode : ' +
		util.format(inputData.chaincode) +
		'\n\n peerNames : ' +
		inputData.peers +
		'\n\n network_config_path: ' +
		inputData.networkConfigFile;
	'\n\n opts: ' + util.format(inputData.opts);
	//console.log(temptext);

	let network_config;
	try {
		network_config = JSON.parse(fs.readFileSync(inputData.networkConfigFile));
	} catch (err) {
		console.error(err);
	}

	// Node SDK implements network and native options, disambiguate on the passed opts
	if (
		inputData.opts &&
		inputData.opts['network-model'] &&
		inputData.opts['network-model'].localeCompare('true') === 0
	) {
		console.log('evaluating transaction .... ');
		return _evaluateTransaction(
			inputData.orgName,
			inputData.chaincode,
			network_config
		);
	} else {
		console.log('performing query .... ');
		return _query(
			inputData.user,
			inputData.peers[0],
			inputData.org,
			inputData.orgName,
			inputData.chaincode,
			network_config
		);
	}
}

/**
 * Perform a query using the NodeJS SDK
 * @param {String} username the user
 * @param {String} peer the peer to use
 * @param {String} userOrg the organisation to use
 * @param {String} orgName the organisation name
 * @param {JSON} chaincode the chaincode descriptor
 * @param {JSON} network_config_details the network configuration
 */
async function _query(
	username,
	peer,
	org,
	orgName,
	chaincode,
	network_config_details
) {
	const user = username.split('@')[1] ? username : username + '@' + org;
	const userOrg = username.split('@')[1] ? username.split('@')[1] : org;
	const target = buildTarget(
		peer,
		orgName,
		network_config_details['network-config']
	);

	Client.setConfigSetting('request-timeout', 60000);

	// this is a transaction, will just use org's identity to
	// submit the request. intentionally we are using a different org
	// than the one that submitted the "move" transaction, although either org
	// should work properly
	const channel = client.newChannel(chaincode.channelId);

	const tlsInfo = await common.getRegisteredUsers(
		client,
		user,
		userOrg,
		network_config_details['networkID'],
		network_config_details['network-config'][orgName]['mspid']
	);
	client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);

	const store = await Client.newDefaultKeyValueStore({
		path: common.getKeyStoreForOrg(userOrg)
	});
	client.setStateStore(store);

	const admin = await common.getRegisteredUsers(
		client,
		user,
		userOrg,
		network_config_details['networkID'],
		network_config_details['network-config'][orgName]['mspid']
	);

	tx_id = client.newTransactionID();
	common.setupPeers(
		peer,
		channel,
		orgName,
		client,
		network_config_details['network-config'],
		network_config_details['tls']
	);

	let request = {
		targets: [target],
		txId: tx_id,
		chaincodeId: chaincode.chaincodeId,
		fcn: chaincode.fcn,
		args: chaincode.args
	};

	try {
		// send query
		const response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			let stringRespose = formatString(response_payloads.toString());
			var jsonResponse = { response: stringRespose };
			console.info('\n query jsonResponse: ', jsonResponse);
			return JSON.stringify(jsonResponse);
		} else {
			console.error('response_payloads is null');
			return { error: 'response_payloads is null' };
		}
	} catch (err) {
		console.error([
			'error',
			'Failed to send query due to error:' + err.stack ? err.stack : err
		]);
		return {
			Error: 'Failed to send query due to error:' + err.stack ? err.stack : err
		};
	}
}

function buildTarget(peer, org, network_config) {
	var target = null;
	if (typeof peer !== 'undefined') {
		let targets = common.newPeers([peer], org, network_config, client);
		if (targets && targets.length > 0) target = targets[0];
	}
	return target;
}

/**
 * Conditionally strip the leading/trailing double quotes
 */
function formatString(inputString) {
	if (
		inputString.charAt(0) == '"' &&
		inputString.charAt(inputString.length - 1) == '"'
	) {
		return inputString.slice(1, -1);
	} else {
		return inputString;
	}
}

/**
 * Perform a query using the NodeJS Netowrk APIs
 * @param {String} org the organisation to use
 * @param {JSON} chaincode the chaincode descriptor
 * @param {JSON} network_config the network configuration
 */
async function _evaluateTransaction(org, chaincode, network_config) {
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
		const result = await contract.evaluateTransaction(...args);

		gateway.disconnect();

		let stringRespose = formatString(result.toString());
		let jsonResponse = { response: stringRespose };
		return JSON.stringify(jsonResponse);
	} catch (err) {
		throw new Error(err);
	}
}

exports.query = query;
require('make-runnable');

// Example test calls
// node query.js query User1@org2.example.com Org2ExampleCom' {"args": ["a"], "fcn":"query", "channelId": "behavesystest", "chaincodeId": "mycc"}' ["peer1.org2.example.com"] /opt/gopath/src/github.com/hyperledger/fabric-test/feature/configs/3f09636eb35811e79e510214683e8447/network-config.json;
// node query.js query User1@org1.example.com Org1ExampleCom '{"channelId": "behavesystest", "args": ["a"], "chaincodeId": "mycc", "name": "mycc", "fcn": "query"}' ['peer0.org1.example.com'] /Users/nkl/go/src/github.com/hyperledger/fabric-test/feature/configs/4fe4f54cc62411e8977eacbc32c08695/network-config.json '{"transaction": "true"}'
