/*
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const helper = require('../../common/helper');

const logger = helper.getLogger('FabricConfig');

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
	getOrganization() {
		return this.config.client.organization;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getTls() {
		logger.info('config.client.tlsEnable ', this.config.client.tlsEnable);
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
			logger.info('FabricConfig, this.config.channels ', x);
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
		const organization = this.config.organizations[this.getOrganization()];

		const orgMsp = organization.mspid;
		const adminPrivateKeyPath = organization.adminPrivateKey.path;
		const signedCertPath = organization.signedCert.path;

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
