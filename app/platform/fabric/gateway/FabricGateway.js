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
const includes = require('lodash/includes');
const helper = require('../../../common/helper');

const logger = helper.getLogger('FabricGateway');
const explorer_mess = require('../../../common/ExplorerMessage').explorer;
const ExplorerError = require('../../../common/ExplorerError');
const FabricConfig = require('../FabricConfig');
const FabricUtils = require('../../fabric/utils/FabricUtils.js');

class FabricGateway {
	constructor(network_name, client_name) {
		this.network_name = network_name;
		this.client_name = client_name;
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
		this.channelsGenHash = new Map();
		this.channels = [];
		this.client_config = null;
	}

	async initialize(client_config, persistence) {
		this.client_config = client_config;
		// Loading client from network configuration file
		logger.debug(
			'Client configuration [%s]  ...',
			this.client_name,
			' this.client_config ',
			this.client_config
		);

		const profileConnection = this.client_config.profile;
		const configPath = path.resolve(__dirname, '../', profileConnection);
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
			await this.initializeClient(persistence);
		} catch (error) {
			logger.error(` ${error}`);
			throw new ExplorerError(explorer_mess.error.ERROR_1010);
		}
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
				const ccInfo = cc.references.get(channelName);
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

	getPeer_pem(pemPath) {
		const data = fs.readFileSync(path.resolve(__dirname, '../../../..', pemPath));
		const pem = Buffer.from(data).toString();
		return pem;
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
				const pemPath = this.config.peers[peer].tlsCACerts.path;
				let grpcOpt = {};
				if ('grpcOptions' in this.config.peers[peer]) {
					grpcOpt = this.config.peers[peer].grpcOptions;
				}
				const peer_endpoint = client.newEndpoint(
					Object.assign(grpcOpt, {
						url: url,
						pem: this.getPeer_pem(pemPath)
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

	async initializeClient(persistence) {
		// Getting channels from queryChannels
		let channels;
		try {
			logger.debug('this.defaultPeer ', this.defaultPeer);
			channels = await this.queryChannels();
		} catch (e) {
			logger.error(e);
		}

		if (channels) {
			this.status = true;
			logger.debug('Client channels >> %j', channels.channels);
			// Initialize channel network information from Discover
			for (const channel of channels.channels) {
				logger.debug('Initializing channel ', channel.channel_id);
				try {
					await this.initializeNewChannel(channel.channel_id);
					logger.debug('Initialized channel >> %s', channel.channel_id);
				} catch (error) {
					logger.error('Failed to initialize new channel: ', channel.channel_id);
				}
			}
		} else if (persistence) {
			logger.info('********* call to initializeDetachClient **********');
			this.initializeDetachClient(this.client_config, persistence);
		} else {
			logger.error('Not found any channels');
		}
	}

	async initializeDetachClient(client_config, persistence) {
		const name = client_config.name;
		logger.debug(
			'initializeDetachClient --> client_config ',
			client_config,
			' name ',
			name
		);
		const profileConnection = client_config.profile;
		const configPath = path.resolve(__dirname, '../', profileConnection);
		const fabricConfig = new FabricConfig();
		fabricConfig.initialize(configPath);
		const config = fabricConfig.getConfig();
		this.userName = fabricConfig.getAdminUser();
		const peers = fabricConfig.getPeersConfig();

		logger.info('initializeDetachClient, network config) ', config);
		logger.info(
			'************************************* initializeDetachClient *************************************************'
		);
		logger.info('Error :', explorer_mess.error.ERROR_1009);
		logger.info('Info : ', explorer_mess.message.MESSAGE_1001);
		logger.info(
			'************************************** initializeDetachClient ************************************************'
		);
		const channels = await persistence
			.getCrudService()
			.getChannelsInfo(this.network_name);

		if (channels.length === 0) {
			throw new ExplorerError(explorer_mess.error.ERROR_2003);
		}

		for (const channel of channels) {
			this.setChannelGenHash(channel.channelname, channel.channel_genesis_hash);
			const nodes = await persistence
				.getMetricService()
				.getPeerList(this.network_name, channel.channel_genesis_hash);
			let newchannel;
			try {
				newchannel = this.Client.getChannel(channel.channelname);
			} catch (e) {
				logger.error('Failed to get channel from client ', e);
			}
			if (newchannel === undefined) {
				newchannel = this.Client.newChannel(channel.channelname);
			}
			for (const node of nodes) {
				const peer_config = peers[node.server_hostname];
				let pem;
				try {
					if (peer_config && peer_config.tlsCACerts) {
						pem = FabricUtils.getPEMfromConfig(peer_config.tlsCACerts);
						const msps = {
							[node.mspid]: {
								tls_root_certs: pem
							}
						};
						logger.debug('msps ', msps);
					}
				} catch (e) {
					logger.error(e);
				}
			}
		}
	}

	async initializeNewChannel(channel_name) {
		// Get genesis block for the channel
		const block = await this.getGenesisBlock(channel_name);
		logger.debug('Genesis Block for client [%s] >> %j', this.client_name, block);

		const channel_genesis_hash = await FabricUtils.generateBlockHash(
			block.header
		);
		// Setting channel_genesis_hash to map
		this.setChannelGenHash(channel_name, channel_genesis_hash);
		this.addChannel(channel_name);
		logger.debug(
			`Channel genesis hash for channel [${channel_name}] >> ${channel_genesis_hash}`
		);
	}

	async initializeChannelFromDiscover(channel_name) {
		logger.debug('initializeChannelFromDiscover ', channel_name);
		if (!includes(this.getChannels(), channel_name)) {
			await this.initializeNewChannel(channel_name);
		}

		const discover_results = await this.getDiscoveryResult(channel_name);
		logger.debug(
			`Discover results for channel [${channel_name}] >>`,
			discover_results
		);

		if ('peers_by_org' in discover_results) {
			for (const org in discover_results.peers_by_org) {
				logger.info('Discovered', org, discover_results.peers_by_org[org].peers);
			}
		}

		return discover_results;
	}

	getEnableAuthentication() {
		return this.enableAuthentication;
	}

	getTls() {
		return this.tlsEnable;
	}

	getConfig() {
		return this.config;
	}

	getDiscoverConfigSetting() {
		let discover;
		if (!this.getTls()) {
			discover = 'grpc';
		} else {
			discover = 'grpcs';
		}
		return Client.getConfigSetting('discovery-protocol', discover);
	}

	async getGenesisBlock(channel) {
		const genesisBlock = await this.queryBlock(channel, 0);
		if (!genesisBlock) {
			logger.error('Failed to get genesis block');
			return null;
		}
		return genesisBlock;
	}

	getChannelNames() {
		return Array.from(this.channelsGenHash.keys());
	}

	getChannels() {
		return this.channels; // Return Array
	}

	addChannel(channelName) {
		this.channels.push(channelName);
	}

	getChannelGenHash(channel_name) {
		return this.channelsGenHash.get(channel_name);
	}

	setChannelGenHash(name, channel_genesis_hash) {
		this.channelsGenHash.set(name, channel_genesis_hash);
	}

	getClientName() {
		return this.client_name;
	}

	getChannelNameByHash(channel_genesis_hash) {
		for (const [channel_name, hash_name] of this.channelsGenHash.entries()) {
			if (channel_genesis_hash === hash_name) {
				return channel_name;
			}
		}
	}

	getDefaultMspId() {
		return this.fabricConfig.getMspId();
	}

	getStatus() {
		return this.status;
	}
}

module.exports = FabricGateway;
