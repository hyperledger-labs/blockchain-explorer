/**
 *    SPDX-License-Identifier: Apache-2.0
 */

 // TODO this class will load the network configuration
var Client = require('fabric-client');
var config = require('../config/config.json');
var FabricCAClient = require('fabric-ca-client');
var log4js = require('log4js');
var logger = log4js.getLogger('HlfNetworkConfig');
var tlsConfigFilePath = '../config/network-config-tls.yaml';
var configFilePath = '../config/network-config.yaml';

logger.setLevel('INFO');

class HlfNetworkConfig {

	constructor(config) {
		this.client = {};
		this.fabricCAClient = {}
		this.adminUser = {}
		this.hleConfig = config["network-config"];
		this.networkConfig = {};
		this.loadNetworkConfiguration();

	}
	/**
	 * Hyperledger Explorer configuration, see /blockchain-explorer/config.json
	 */

	getHleConfig() {
		return this.hleConfig;
	}
	loadNetworkConfiguration() {
		if (this.isEnableTls()) {
			this.client = Client.loadFromConfig(tlsConfigFilePath);
		} else {
			this.client = Client.loadFromConfig(configFilePath);
		}
		this.networkConfig = this.client._network_config._network_config;
	}
	/**
		 *  If "enableTls":true, will load "network-config-tls.yaml"  see /blockchain-explorer/config.json
		 */
	isEnableTls() {
		return this.hleConfig.enableTls;
	}

	getPeersForOrg(orgName) {
		return this.client.getPeersForOrg(orgName);
	}

	getNetworkConfig() {
		return this.networkConfig;
	}

	//TODO, add more functions or use this.client

}


module.exports = new HlfNetworkConfig(config);
