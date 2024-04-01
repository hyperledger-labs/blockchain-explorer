/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { X509Identity, Wallets, Gateway } from 'fabric-network';
import * as fabprotos from 'fabric-protos';
import { Discoverer, DiscoveryService } from 'fabric-common';
import concat from 'lodash/concat';
import * as path from 'path';
import { helper } from '../../../common/helper';
import { explorerError } from '../../../common/ExplorerMessage';
import { ExplorerError } from '../../../common/ExplorerError';

/* eslint-disable @typescript-eslint/no-var-requires */
const { BlockDecoder, Client } = require('fabric-common');
const FabricCAServices = require('fabric-ca-client');
/* eslint-enable @typescript-eslint/no-var-requires */

const logger = helper.getLogger('FabricGateway');

export class FabricGateway {
	fabricConfig: any;
	config: any;
	gateway: any;
	wallet: any;
	tlsEnable: boolean;
	defaultChannelName: string;
	fabricCaEnabled: boolean;
	client: any;
	clientTlsIdentity: X509Identity;
	FSWALLET: string;
	enableAuthentication: boolean;
	asLocalhost: boolean;
	ds: DiscoveryService;
	dsTargets: Discoverer[];

	/**
	 * Creates an instance of FabricGateway.
	 * @param {FabricConfig} config
	 * @memberof FabricGateway
	 */
	constructor(fabricConfig) {
		this.fabricConfig = fabricConfig;
		this.config = this.fabricConfig.getConfig();
		this.gateway = null;
		this.wallet = null;
		this.tlsEnable = false;
		this.defaultChannelName = null;
		this.gateway = new Gateway();
		this.fabricCaEnabled = false;
		this.client = null;
		this.clientTlsIdentity = null;
		this.FSWALLET = null;
		this.enableAuthentication = false;
		this.asLocalhost = false;
		this.ds = null;
		this.dsTargets = [];
	}

	async initialize() {
		this.fabricCaEnabled = this.fabricConfig.isFabricCaEnabled();
		this.tlsEnable = this.fabricConfig.getTls();
		this.enableAuthentication = this.fabricConfig.getEnableAuthentication();
		this.FSWALLET = 'wallet/' + this.fabricConfig.getNetworkId();

		const explorerAdminId = this.fabricConfig.getAdminUser();
		if (!explorerAdminId) {
			logger.error('Failed to get admin ID from configuration file');
			throw new ExplorerError(explorerError.ERROR_1010);
		}

		const info = `Loading configuration  ${this.config}`;
		logger.debug(info.toUpperCase());

		this.defaultChannelName = this.fabricConfig.getDefaultChannel();
		try {
			// Create a new file system based wallet for managing identities.
			const walletPath = path.join(process.cwd(), this.FSWALLET);
			this.wallet = await Wallets.newFileSystemWallet(walletPath);
			// Check to see if we've already enrolled the admin user.
			const identity = await this.wallet.get(explorerAdminId);
			if (identity) {
				logger.debug(
					`An identity for the admin user: ${explorerAdminId} already exists in the wallet`
				);
			} else if (this.fabricCaEnabled) {
				logger.info('CA enabled');

				await this.enrollCaIdentity(
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
				await this.enrollUserIdentity(
					explorerAdminId,
					signedCertPem,
					adminPrivateKeyPem
				);
				logger.info('1');
			}

			if (!this.tlsEnable) {
				Client.setConfigSetting('discovery-protocol', 'grpc');
			} else {
				Client.setConfigSetting('discovery-protocol', 'grpcs');
			}
			logger.info('2');

			// Set connection options; identity and wallet
			this.asLocalhost =
				String(Client.getConfigSetting('discovery-as-localhost', 'true')) ===
				'true';
			logger.info('3');

			const connectionOptions = {
				identity: explorerAdminId,
				wallet: this.wallet,
				discovery: {
					enabled: true,
					asLocalhost: this.asLocalhost
				},
				clientTlsIdentity: ''
			};
			logger.info('4', connectionOptions);

			const mTlsIdLabel = this.fabricConfig.getClientTlsIdentity();
			if (mTlsIdLabel) {
				logger.info('client TLS enabled');
				this.clientTlsIdentity = await this.wallet.get(mTlsIdLabel);
				if (this.clientTlsIdentity !== undefined) {
					connectionOptions.clientTlsIdentity = mTlsIdLabel;
				} else {
					throw new ExplorerError(
						`Not found Identity ${mTlsIdLabel} in your wallet`
					);
				}
			}
			logger.info('5', this.config);

			// Connect to gateway
			await this.gateway.connect(this.config, connectionOptions);
		} catch (error) {
			logger.error(
				`${explorerError.ERROR_1010}: ${JSON.stringify(error, null, 2)}`
			);
			throw new ExplorerError(explorerError.ERROR_1010);
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
		logger.info('enrollUserIdentity: userName :', userName);
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
			const caName = this.config.organizations[this.fabricConfig.getOrganization()]
				.certificateAuthorities[0];
			const ca = new FabricCAServices(
				this.config.certificateAuthorities[caName].url,
				{
					trustedRoots: this.fabricConfig.getTlsCACertsPem(caName),
					verify: false
				}
			);

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
		const network = await this.gateway.getNetwork(channelName);
		let contract = network.getContract('lscc');
		let result = await contract.evaluateTransaction('GetChaincodes');
		let resultJson = fabprotos.protos.ChaincodeQueryResponse.decode(result);
		if (resultJson.chaincodes.length <= 0) {
			resultJson = { chaincodes: [], toJSON: null };
			contract = network.getContract('_lifecycle');
			result = await contract.evaluateTransaction('QueryChaincodeDefinitions', '');
			const decodedReult = fabprotos.lifecycle.QueryChaincodeDefinitionsResult.decode(
				result
			);
			for (const cc of decodedReult.chaincode_definitions) {
				resultJson.chaincodes = concat(resultJson.chaincodes, {
					name: cc.name,
					version: cc.version
				});
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

	async setupDiscoveryRequest(channelName) {
		try {
			const network = await this.gateway.getNetwork(channelName);
			const channel = network.getChannel();
			this.ds = new DiscoveryService('be discovery service', channel);

			const idx = this.gateway.identityContext;
			// do the three steps
			this.ds.build(idx);
			this.ds.sign(idx);
		} catch (error) {
			logger.error('Failed to set up discovery service for channel', error);
			this.ds = null;
		}
	}

	async getDiscoveryServiceTarget() {
		const client = new Client('discovery client');
		if (this.clientTlsIdentity) {
			logger.info('client TLS enabled');
			client.setTlsClientCertAndKey(
				this.clientTlsIdentity.credentials.certificate,
				this.clientTlsIdentity.credentials.privateKey
			);
		} else {
			client.setTlsClientCertAndKey();
		}

		const targets: Discoverer[] = [];
		const mspID = this.config.client.organization;
		for (const peer of this.config.organizations[mspID].peers) {
			const discoverer = new Discoverer(`be discoverer ${peer}`, client, mspID);
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
		return targets;
	}

	async sendDiscoveryRequest() {
		let result;
		try {
			logger.info('Sending discovery request...');
			await this.ds
				.send({
					asLocalhost: this.asLocalhost,
					requestTimeout: 5000,
					refreshAge: 15000,
					targets: this.dsTargets
				})
				.then(() => {
					logger.info('Succeeded to send discovery request');
				})
				.catch(error => {
					if (error) {
						logger.warn('Failed to send discovery request for channel', error);
						this.ds.close();
					}
				});

			result = await this.ds.getDiscoveryResults(true);
		} catch (error) {
			logger.warn('Failed to send discovery request for channel', error);
			if (this.ds) {
				this.ds.close();
				this.ds = null;
			}
			result = null;
		}
		return result;
	}

	async getDiscoveryResult(channelName) {
		await this.setupDiscoveryRequest(channelName);

		if (!this.dsTargets.length) {
			this.dsTargets = await this.getDiscoveryServiceTarget();
		}

		if (this.ds && this.dsTargets.length) {
			const result = await this.sendDiscoveryRequest();
			return result;
		}

		return null;
	}

	async getActiveOrderersList(channel_name) {
		const network = await this.gateway.getNetwork(channel_name);
		let orderers = [];
		try {
			for (let [orderer, ordererMetadata] of network.discoveryService.channel
				.committers) {
				let ordererAtrributes = {
					name: orderer,
					connected: ordererMetadata.connected
				};
				orderers.push(ordererAtrributes);
			}
			return orderers;
		} catch (error) {
			logger.error(`Failed to get orderers list : `, error);
			return orderers;
		}
	}

	async queryTransaction(channelName: string, txnId: string) {
		try {
			const network = await this.gateway.getNetwork(this.defaultChannelName);
			// Get the contract from the network.
			const contract = network.getContract('qscc');
			const resultByte = await contract.evaluateTransaction(
				'GetTransactionByID',
				channelName,
				txnId
			);
			const resultJson = BlockDecoder.decodeTransaction(resultByte);
			logger.debug('queryTransaction', resultJson);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get transaction ${txnId} from channel ${channelName} : `,
				error
			);
			return null;
		}
	}
	async queryContractMetadata(channel_name, contract_name) {
		const network = await this.gateway.getNetwork(channel_name);
		const contract = network.getContract(contract_name);
		// Get the contract metadata from the network.
		const result = await contract.evaluateTransaction(
			'org.hyperledger.fabric:GetMetadata'
		);
		const metadata = JSON.parse(result.toString('utf8'));
		logger.debug('queryContractMetadata', metadata);
		return metadata;
	}

	async queryBlockByTxId(channelName, txnId) {
		try {
			const network = await this.gateway.getNetwork(channelName);
			const contract = network.getContract('qscc');
			const resultByte = await contract.evaluateTransaction(
				'GetBlockByTxID',
				channelName,
				txnId
			);
			const resultJson = BlockDecoder.decode(resultByte);
			logger.debug('queryBlockByTxnId', resultJson);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get Block ${txnId} from channel ${channelName} : `,
				error
			);
			return null;
		}
	}
	async queryBlockByHash(channelName, block_hash) {
		try {
			const network = await this.gateway.getNetwork(channelName);
			const contract = network.getContract('qscc');
			const resultByte = await contract.evaluateTransaction(
				'GetBlockByHash',
				channelName,
				Buffer.from(block_hash, 'hex')
			);
			const resultJson = BlockDecoder.decode(resultByte);
			logger.debug('queryBlockByHash', resultJson);
			return resultJson;
		} catch (error) {
			logger.error(
				`Failed to get Block ${block_hash} from channel ${channelName} : `,
				error
			);
			return null;
		}
	}

	async queryEndorsersCommitter(channelName) {
		try {
			const network = await this.gateway.getNetwork(channelName);
			const channel = network.getChannel();

			const eventService = channel.newEventService('listener');
			let endorsers = [];
			let committers = [];
			for (const element of eventService.channel.committers.keys()) {
				committers.push(element);
			}
			for (const element of eventService.channel.endorsers.keys()) {
				endorsers.push(element);
			}
			return { committers: committers, endorsers: endorsers };
		} catch (error) {
			logger.error(
				`Failed to get Committers and Endorsers from channel ${channelName} : `,
				error
			);
			return null;
		}
	}
}
