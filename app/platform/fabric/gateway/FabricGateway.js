/*
 *SPDX-License-Identifier: Apache-2.0
 */

const { Wallets, Gateway } = require('fabric-network');
const {
	Discoverer,
	DiscoveryService,
	Client,
	BlockDecoder
} = require('fabric-common');
const fabprotos = require('fabric-protos');
const concat = require('lodash/concat');

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
		this.enableAuthentication = this.fabricConfig.getEnableAuthentication();
		this.networkName = this.fabricConfig.getNetworkName();
		this.FSWALLET = 'wallet/' + this.networkName;

		const explorerAdminId = this.fabricConfig.getAdminUser();
		const info = `Loading configuration  ${this.config}`;
		logger.debug(info.toUpperCase());

		const peers = this.fabricConfig.getPeers();
		this.defaultPeer = peers[0].name;
		this.defaultPeerUrl = peers[0].url;

		logger.info('========== > defaultPeer ', this.defaultPeer);
		/* eslint-disable */

		this.defaultChannelName = this.fabricConfig.getDefaultChannel();
		/* eslint-enable */
		let identity;
		try {
			// Create a new file system based wallet for managing identities.
			const walletPath = path.join(process.cwd(), this.FSWALLET);
			this.wallet = await Wallets.newFileSystemWallet(walletPath);
			// Check to see if we've already enrolled the admin user.
			identity = await this.wallet.get(explorerAdminId);
			if (identity) {
				logger.debug(
					`An identity for the admin user: ${explorerAdminId} already exists in the wallet`
				);
			} else if (this.fabricCaEnabled) {
				logger.info('CA enabled');

				identity = await this.enrollCaIdentity(
					explorerAdminId,
					this.fabricConfig.getAdminPassword()
				);
			} else {
				/*
				 * Identity credentials to be stored in the wallet
				 * Look for signedCert in first-network-connection.json
				 */

				const signedCertPem = this.fabricConfig.getOrgSignedCertPem();
				const adminPrivateKeyPem = this.fabricConfig.getOrgAdminPrivateKeyPem();
				identity = this.enrollUserIdentity(
					explorerAdminId,
					signedCertPem,
					adminPrivateKeyPem
				);
			}

			if (!this.tlsEnable) {
				Client.setConfigSetting('discovery-protocol', 'grpc');
			} else {
				Client.setConfigSetting('discovery-protocol', 'grpcs');
			}

			// Set connection options; identity and wallet
			this.asLocalhost =
				String(Client.getConfigSetting('discovery-as-localhost', 'true')) ===
				'true';

			const connectionOptions = {
				identity: explorerAdminId,
				wallet: this.wallet,
				discovery: {
					enabled: true,
					asLocalhost: this.asLocalhost
				}
			};

			// Connect to gateway
			await this.gateway.connect(this.config, connectionOptions);
		} catch (error) {
			logger.error(`${error}`);
			throw new ExplorerError(explorer_mess.error.ERROR_1010);
		}
	}

	getEnableAuthentication() {
		return this.enableAuthentication;
	}

	getDiscoveryProtocol() {
		return Client.getConfigSetting('discovery-protocol');
	}

	getDefaultMspId() {
		return this.fabricConfig.getMspId();
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
	async enrollUserIdentity(userName, signedCertPem, adminPrivateKeyPem) {
		const identity = {
			credentials: {
				certificate: signedCertPem,
				privateKey: adminPrivateKeyPem
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
				enrollmentID: this.fabricConfig.getCaAdminUser(),
				enrollmentSecret: this.fabricConfig.getCaAdminPassword()
			});

			logger.info('>>>>>>>>>>>>>>>>>>>>>>>>> enrollment : ca admin');

			const identity = {
				credentials: {
					certificate: enrollment.certificate,
					privateKey: enrollment.key.toBytes()
				},
				mspId: this.fabricConfig.getMspId(),
				type: 'X.509'
			};

			// Import identity wallet
			await this.wallet.put(this.fabricConfig.getCaAdminUser(), identity);

			const adminUser = await this.getUserContext(
				this.fabricConfig.getCaAdminUser()
			);
			await ca.register(
				{
					affiliation: this.fabricConfig.getAdminAffiliation(),
					enrollmentID: id,
					enrollmentSecret: secret,
					role: 'admin'
				},
				adminUser
			);

			const enrollmentBEAdmin = await ca.enroll({
				enrollmentID: id,
				enrollmentSecret: secret
			});

			logger.info(
				'>>>>>>>>>>>>>>>>>>>>>>>>> registration & enrollment : BE admin'
			);

			const identityBEAdmin = {
				credentials: {
					certificate: enrollmentBEAdmin.certificate,
					privateKey: enrollmentBEAdmin.key.toBytes()
				},
				mspId: this.fabricConfig.getMspId(),
				type: 'X.509'
			};
			await this.wallet.put(id, identityBEAdmin);

			logger.debug('Successfully get user enrolled and imported to wallet, ', id);

			return identityBEAdmin;
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
		logger.debug('queryChannels', resultJson);
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
			logger.debug('queryBlock', resultJson);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get block ${blockNum} from channel ${channelName} : `,
				error
			);
			return null;
		}
	}

	async queryInstantiatedChaincodes(channelName) {
		logger.info('queryInstantiatedChaincodes', channelName);
		const network = await this.gateway.getNetwork(this.defaultChannelName);
		let contract = network.getContract('lscc');
		let result = await contract.evaluateTransaction('GetChaincodes');
		let resultJson = fabprotos.protos.ChaincodeQueryResponse.decode(result);
		if (resultJson.chaincodes.length <= 0) {
			resultJson = { chaincodes: [] };
			contract = network.getContract('_lifecycle');
			result = await contract.evaluateTransaction('QueryInstalledChaincodes', '');
			const decodedReult = fabprotos.lifecycle.QueryInstalledChaincodesResult.decode(
				result
			);
			for (const cc of decodedReult.installed_chaincodes) {
				logger.info('1:', cc);
				const ccInfo = cc.references[channelName];
				if (ccInfo !== undefined) {
					logger.info('2:', ccInfo);
					resultJson.chaincodes = concat(resultJson.chaincodes, ccInfo.chaincodes);
				}
			}
		}
		logger.debug('queryInstantiatedChaincodes', resultJson);
		return resultJson;
	}

	async queryChainInfo(channelName) {
		try {
			const network = await this.gateway.getNetwork(this.defaultChannelName);

			// Get the contract from the network.
			const contract = network.getContract('qscc');
			const resultByte = await contract.evaluateTransaction(
				'GetChainInfo',
				channelName
			);
			const resultJson = fabprotos.common.BlockchainInfo.decode(resultByte);
			logger.debug('queryChainInfo', resultJson);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get chain info from channel ${channelName} : `,
				error
			);
			return null;
		}
	}

	async getDiscoveryResult(channelName) {
		try {
			const network = await this.gateway.getNetwork(channelName);
			const channel = network.getChannel();
			const ds = new DiscoveryService('be discovery service', channel);

			const client = new Client('discovery client');
			client.setTlsClientCertAndKey();

			const mspID = this.config.client.organization;
			const targets = [];
			for (const peer of this.config.organizations[mspID].peers) {
				const discoverer = new Discoverer(`be discoverer ${peer}`, client);
				const url = this.config.peers[peer].url;
				const pem = this.fabricConfig.getPeerTlsCACertsPem(peer);
				let grpcOpt = {};
				if ('grpcOptions' in this.config.peers[peer]) {
					grpcOpt = this.config.peers[peer].grpcOptions;
				}
				const peer_endpoint = client.newEndpoint(
					Object.assign(grpcOpt, {
						url: url,
						pem: pem
					})
				);
				await discoverer.connect(peer_endpoint);
				targets.push(discoverer);
			}

			const idx = this.gateway.identityContext;
			// do the three steps
			ds.build(idx);
			ds.sign(idx);
			await ds.send({
				asLocalhost: true,
				refreshAge: 15000,
				targets: targets
			});

			const result = await ds.getDiscoveryResults(true);
			return result;
		} catch (error) {
			logger.error(
				`Failed to get discovery result from channel ${channelName} : `,
				error
			);
		}
		return null;
	}
}

module.exports = FabricGateway;
