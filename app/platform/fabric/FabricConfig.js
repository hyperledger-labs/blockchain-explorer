/*
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');

/**
 *
 *
 * @class FabricConfig
 */
class FabricConfig {
	/**
	 * Creates an instance of FabricConfig.
	 * @memberof FabricConfig
	 */

	/*eslint-disable */
	constructor() {}

	/* eslint-enable */
	/**
	 *
	 *
	 * @param {*} configPath
	 * @memberof FabricConfig
	 */

	initialize(configPath) {
		const configJson = fs.readFileSync(configPath, 'utf8');
		this.config = JSON.parse(configJson);
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getConfig() {
		return this.config;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	isFabricCaEnabled() {
		if (this.config.certificateAuthorities) {
			return true;
		}
		return false;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getTls() {
		console.log('config.client.tlsEnable ', this.config.client.tlsEnable);
		return this.config.client.tlsEnable;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getEnableAuthentication() {
		return this.config.client.enableAuthentication;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getAdminUser() {
		return this.config.client.adminUser;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getNetworkName() {
		return this.config.name;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getAdminPassword() {
		return this.config.client.adminPassword;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getDefaultChannel() {
		let defChannel;
		for (const x in this.config.channels) {
			// Getting default channel
			console.log('FabricConfig, this.config.channels ', x);
			if (x) {
				defChannel = x;
			}
		}
		return defChannel;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getDefaultPeerConfig() {
		let defaultPeerConfig = [];
		const peers = this.getPeersConfig();
		if (peers) {
			defaultPeerConfig = peers[0];
		}
		return defaultPeerConfig;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getPeersConfig() {
		const peers = [];
		for (const x in this.config.peers) {
			// TODO may need to handle multiple fabric-ca server ??
			if (this.config.peers[x].url) {
				const peer = {
					name: x,
					url: this.config.peers[x].url,
					tlsCACerts: this.config.peers[x].tlsCACerts,
					eventUrl: this.config.peers[x].eventUrl,
					grpcOptions: this.config.peers[x].grpcOptions
				};
				peers.push(peer);
			}
		}
		return peers;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getOrganizationsConfig() {
		const orgMsp = [];
		let adminPrivateKeyPath;
		let signedCertPath;
		for (const x in this.config.organizations) {
			if (this.config.organizations[x].mspid) {
				orgMsp.push(this.config.organizations[x].mspid);
			}
			if (this.config.organizations[x].adminPrivateKey) {
				adminPrivateKeyPath = this.config.organizations[x].adminPrivateKey.path;
			}
			if (this.config.organizations[x].signedCert) {
				signedCertPath = this.config.organizations[x].signedCert.path;
			}
		}
		return { orgMsp, adminPrivateKeyPath, signedCertPath };
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getServerCertPath() {
		let serverCertPath = null;
		if (this.config.certificateAuthorities) {
			for (const x in this.config.certificateAuthorities) {
				if (this.config.certificateAuthorities[x].tlsCACerts) {
					serverCertPath = this.config.certificateAuthorities[x].tlsCACerts.path;
				}
			}
		}

		return serverCertPath;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getCertificateAuthorities() {
		const caURL = [];
		let serverCertPath = null;

		if (this.config.certificateAuthorities) {
			for (const x in this.config.certificateAuthorities) {
				if (this.config.certificateAuthorities[x].tlsCACerts) {
					serverCertPath = this.config.certificateAuthorities[x].tlsCACerts.path;
				}
				if (this.config.certificateAuthorities[x].url) {
					caURL.push(this.config.certificateAuthorities[x].url);
				}
			}
		}
		return { caURL, serverCertPath };
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getPeers() {
		const peers = [];
		for (const x in this.config.peers) {
			if (this.config.peers[x].url) {
				const peer = {
					name: x,
					url: this.config.peers[x].url,
					tlsCACerts: this.config.peers[x].tlsCACerts,
					eventUrl: this.config.peers[x].eventUrl,
					grpcOptions: this.config.peers[x].grpcOptions
				};
				peers.push(peer);
			}
		}
		return peers;
	}
}

module.exports = FabricConfig;
