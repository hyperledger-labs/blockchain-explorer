/*
 *SPDX-License-Identifier: Apache-2.0
 */

const {
	FileSystemWallet,
	Gateway,
	X509WalletMixin
} = require('fabric-network');

const FabricCAServices = require('fabric-ca-client');

const fs = require('fs');
const path = require('path');
const helper = require('../../../common/helper');

const logger = helper.getLogger('FabricGateway');
const explorer_mess = require('../../../common/ExplorerMessage').explorer;
const ExplorerError = require('../../../common/ExplorerError');
const FabricConfig = require('../FabricConfig');

class FabricGateway {
	constructor(networkConfig) {
		this.networkConfig = networkConfig;
		this.config = null;
		this.gateway = null;
		this.userName = null;
		this.enrollmentSecret = null;
		this.identityLabel = null;
		this.mspId = null;
		this.wallet = null;
		this.tlsEnable = false;
		this.defaultChannelName = null;
		this.defaultPeer = null;
		this.defaultPeerUrl = null;
		this.gateway = new Gateway();
		this.fabricConfig = new FabricConfig();
		this.fabricCaEnabled = false;
		this.networkName = null;
		this.client = null;
		this.FSWALLET = null;
		this.enableAuthentication = false;
	}

	async initialize() {
		const configPath = path.resolve(__dirname, this.networkConfig);
		this.fabricConfig = new FabricConfig();
		this.fabricConfig.initialize(configPath);
		this.config = this.fabricConfig.getConfig();
		this.fabricCaEnabled = this.fabricConfig.isFabricCaEnabled();
		this.tlsEnable = this.fabricConfig.getTls();
		this.userName = this.fabricConfig.getAdminUser();
		this.enrollmentSecret = this.fabricConfig.getAdminPassword();
		this.enableAuthentication = this.fabricConfig.getEnableAuthentication();
		this.networkName = this.fabricConfig.getNetworkName();
		this.identityLabel = this.userName;
		this.FSWALLET = 'wallet/' + this.networkName;

		const info = `Loading configuration  ${this.config}`;
		logger.debug(info.toUpperCase());

		const peers = this.fabricConfig.getPeers();
		this.defaultPeer = peers[0].name;
		this.defaultPeerUrl = peers[0].url;
		let orgMsp;
		let signedCertPath;
		let adminPrivateKeyPath;
		logger.log('========== > defaultPeer ', this.defaultPeer);
		/* eslint-disable */
		({
			orgMsp,
			adminPrivateKeyPath,
			signedCertPath
		} = this.fabricConfig.getOrganizationsConfig());
		logger.log(
			'signedCertPath ',
			signedCertPath,
			' \nadminPrivateKeyPath ',
			adminPrivateKeyPath
		);

		this.defaultChannelName = this.fabricConfig.getDefaultChannel();
		this.mspId = orgMsp;
		let caURL = [];
		let serverCertPath = null;
		({ caURL, serverCertPath } = this.fabricConfig.getCertificateAuthorities());
		/* eslint-enable */
		let identity;
		let enrollment;

		try {
			// Create a new file system based wallet for managing identities.
			const walletPath = path.join(process.cwd(), this.FSWALLET);
			this.wallet = new FileSystemWallet(walletPath);
			// Check to see if we've already enrolled the admin user.
			const adminExists = await this.wallet.exists(this.userName);
			if (adminExists) {
				logger.debug(
					`An identity for the admin user: ${
						this.userName
					} already exists in the wallet`
				);
				await this.wallet.export(this.userName);
			} else if (!adminExists) {
				if (this.fabricCaEnabled) {
					({ enrollment, identity } = await this._enrollCaIdentity(
						caURL,
						enrollment,
						identity
					));
				} else {
					/*
					 * Identity credentials to be stored in the wallet
					 * Look for signedCert in first-network-connection.json
					 */
					identity = await this._enrollUserIdentity(
						signedCertPath,
						adminPrivateKeyPath,
						identity
					);
				}
			}

			// Set connection options; identity and wallet
			const connectionOptions = {
				identity: this.userName,
				mspId: this.mspId,
				wallet: this.wallet,
				discovery: {
					enabled: true
				},
				clientTlsIdentity: this.userName,
				eventHandlerOptions: {
					commitTimeout: 100
				}
			};

			// Connect to gateway
			await this.gateway.connect(
				this.config,
				connectionOptions
			);
			this.client = this.gateway.getClient();
		} catch (error) {
			logger.error(` ${error}`);
			throw new ExplorerError(explorer_mess.error.ERROR_1010);
		}
	}

	getDefaultChannelName() {
		return this.defaultChannelName;
	}
	getEnableAuthentication() {
		return this.enableAuthentication;
	}

	getDefaultPeer() {
		return this.defaultPeer;
	}
	getDefaultPeerUrl() {
		return this.defaultPeerUrl;
	}

	getDefaultMspId() {
		return this.mspId;
	}
	async getClient() {
		return this.gateway.getClient();
	}

	getTls() {
		return this.tlsEnable;
	}

	getConfig() {
		return this.config;
	}

	/**
	 * @private method
	 *
	 */
	async _enrollUserIdentity(signedCertPath, adminPrivateKeyPath, identity) {
		const _signedCertPath = signedCertPath;
		const _adminPrivateKeyPath = adminPrivateKeyPath;
		const cert = fs.readFileSync(_signedCertPath, 'utf8');
		// See in first-network-connection.json adminPrivateKey key
		const key = fs.readFileSync(_adminPrivateKeyPath, 'utf8');
		identity = X509WalletMixin.createIdentity(this.mspId, cert, key);
		logger.log('this.identityLabel ', this.identityLabel);
		await this.wallet.import(this.identityLabel, identity);
		return identity;
	}

	/**
	 * @private method
	 *
	 */
	async _enrollCaIdentity(caURL, enrollment, identity) {
		try {
			logger.log(
				'this.fabricCaEnabled ',
				this.fabricCaEnabled,
				' caURL[0] ',
				caURL
			);
			if (this.fabricCaEnabled) {
				const ca = new FabricCAServices(caURL[0]);
				enrollment = await ca.enroll({
					enrollmentID: this.userName,
					enrollmentSecret: this.fabricConfig.getAdminPassword()
				});
				logger.log('>>>>>>>>>>>>>>>>>>>>>>>>> enrollment ', enrollment);
				identity = X509WalletMixin.createIdentity(
					this.mspId,
					enrollment.certificate,
					enrollment.key.toBytes()
				);
				logger.log('identity ', identity);
				// Import identity wallet
				await this.wallet.import(this.identityLabel, identity);
			}
		} catch (error) {
			/*
			 * TODO add explanation for message 'Calling enrollment endpoint failed with error [Error: connect ECONNREFUSED 127.0.0.1:7054]'
			 * Reason : no fabric running, check your network
			 */
			logger.error('Error instantiating FabricCAServices ', error);
			// TODO decide how to proceed if error
		}
		return {
			enrollment,
			identity
		};
	}

	async getIdentityInfo(label) {
		let identityInfo;
		logger.info('Searching for an identity with label: ', label);
		try {
			const list = await this.wallet.list();
			identityInfo = list.filter(id => {
				return id.label === label;
			});
		} catch (error) {
			logger.error(error);
		}
		return identityInfo;
	}
}

module.exports = FabricGateway;
