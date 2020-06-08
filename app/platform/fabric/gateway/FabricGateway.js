/*
 *SPDX-License-Identifier: Apache-2.0
 */

const { Wallets, Gateway } = require('fabric-network');
const { BlockDecoder, Client } = require('fabric-common');
const fabprotos = require('fabric-protos');

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
		this.enrollmentSecret = null;
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
		this.asLocalhost = false;
	}

	async initialize() {
		const configPath = path.resolve(__dirname, this.networkConfig);
		this.fabricConfig = new FabricConfig();
		this.fabricConfig.initialize(configPath);
		this.config = this.fabricConfig.getConfig();
		this.fabricCaEnabled = this.fabricConfig.isFabricCaEnabled();
		this.tlsEnable = this.fabricConfig.getTls();
		this.enrollmentSecret = this.fabricConfig.getAdminPassword();
		this.enableAuthentication = this.fabricConfig.getEnableAuthentication();
		this.networkName = this.fabricConfig.getNetworkName();
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
			'orgMsp :',
			orgMsp,
			'\n',
			'signedCertPath :',
			signedCertPath,
			'\n',
			'adminPrivateKeyPath ',
			adminPrivateKeyPath
		);

		this.defaultChannelName = this.fabricConfig.getDefaultChannel();
		const caURLs = this.fabricConfig.getCertificateAuthorities();
		/* eslint-enable */
		let identity;
		try {
			// Create a new file system based wallet for managing identities.
			const walletPath = path.join(process.cwd(), this.FSWALLET);
			this.wallet = await Wallets.newFileSystemWallet(walletPath);
			// Check to see if we've already enrolled the admin user.
			identity = await this.wallet.get(this.fabricConfig.getAdminUser());
			if (identity) {
				logger.debug(
					`An identity for the admin user: ${this.fabricConfig.getAdminUser()} already exists in the wallet`
				);
			} else if (this.fabricCaEnabled) {
				identity = await this.enrollCaIdentity(
					this.fabricConfig.getAdminUser(),
					this.fabricConfig.getAdminPassword()
				);
			} else {
				/*
				 * Identity credentials to be stored in the wallet
				 * Look for signedCert in first-network-connection.json
				 */
				identity = this.enrollUserIdentity(
					this.fabricConfig.getAdminUser(),
					signedCertPath,
					adminPrivateKeyPath
				);
			}

			// Set connection options; identity and wallet
			this.asLocalhost =
				String(Client.getConfigSetting('discovery-as-localhost', 'true')) ===
				'true';

			const connectionOptions = {
				identity: this.fabricConfig.getAdminUser(),
				wallet: this.wallet,
				discovery: {
					enabled: true,
					asLocalhost: this.asLocalhost
				}
			};

			// Connect to gateway
			await this.gateway.connect(this.config, connectionOptions);
			// this.client = this.gateway.getClient();
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
		return this.fabricConfig.getMspId();
	}
	async getClient() {
		return this.client;
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
	async enrollUserIdentity(userName, signedCertPath, adminPrivateKeyPath) {
		const _signedCertPath = signedCertPath;
		const _adminPrivateKeyPath = adminPrivateKeyPath;
		const cert = fs.readFileSync(_signedCertPath, 'utf8');
		// See in first-network-connection.json adminPrivateKey key
		const key = fs.readFileSync(_adminPrivateKeyPath, 'utf8');
		const identity = {
			credentials: {
				certificate: cert,
				privateKey: key
			},
			mspId: this.fabricConfig.getMspId(),
			type: 'X.509'
		};
		logger.log('enrollUserIdentity: userName :', userName);
		await this.wallet.put(userName, identity);
		return identity;
	}

	/**
	 * @private method
	 *
	 */
	async enrollCaIdentity(id, secret) {
		if (!this.fabricCaEnabled) {
			logger.error('CA server is not configured');
			return null;
		}

		try {
			const caConfig = this.fabricConfig.getCertificateAuthorities();
			const tlsCACert = fs.readFileSync(caConfig.serverCertPath, 'utf8');

			const ca = new FabricCAServices(caConfig.caURL[0], {
				trustedRoots: tlsCACert,
				verify: false
			});

			const enrollment = await ca.enroll({
				enrollmentID: id,
				enrollmentSecret: secret
			});
			logger.log('>>>>>>>>>>>>>>>>>>>>>>>>> enrollment ', enrollment);

			const identity = {
				credentials: {
					certificate: enrollment.certificate,
					privateKey: enrollment.key.toBytes()
				},
				mspId: this.fabricConfig.getMspId(),
				type: 'X.509'
			};
			logger.log('identity ', identity);
			// Import identity wallet
			await this.wallet.put(id, identity);
			logger.debug('Successfully get user enrolled and imported to wallet, ', id);

			return identity;
		} catch (error) {
			// TODO decide how to proceed if error
			logger.error('Error instantiating FabricCAServices ', error);
			return null;
		}
	}

	async getUserContext(user) {
		const identity = await this.wallet.get(user);
		if (!identity) {
			logger.error('Not exist user :', user);
			return null;
		}
		const provider = this.wallet.getProviderRegistry().getProvider(identity.type);
		const userContext = await provider.getUserContext(identity, user);
		return userContext;
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

	async queryChannels() {
		const network = await this.gateway.getNetwork(this.defaultChannelName);

		// Get the contract from the network.
		const contract = network.getContract('cscc');
		const result = await contract.evaluateTransaction('GetChannels');
		const resultJson = fabprotos.protos.ChannelQueryResponse.decode(result);
		return resultJson;
	}

	async queryBlock(channelName, blockNum) {
		try {
			const network = await this.gateway.getNetwork(this.defaultChannelName);

			// Get the contract from the network.
			const contract = network.getContract('qscc');
			const resultByte = await contract.evaluateTransaction(
				'GetBlockByNumber',
				channelName,
				String(blockNum)
			);
			const resultJson = BlockDecoder.decode(resultByte);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get block ${blockNum} from channel ${channelName} : `,
				error
			);
			return null;
		}
	}
}

module.exports = FabricGateway;
