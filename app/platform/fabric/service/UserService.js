/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

const User = require('../models/User');
const helper = require('../../../common/helper');
const logger = helper.getLogger('UserService');

const { X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

/**
 *
 *
 * @class UserService
 */
class UserService {
	/**
	 *Creates an instance of UserService.
	 * @param {*} platform
	 * @memberof UserService
	 */
	constructor(platform) {
		this.platform = platform;
	}
	// 1. If config file for a network contains  "enableAuthentication": true|false, based on this flag authenticate
	// Platform gives an access to the network configuration, and the client that is derived from the FabricGateway
	/* TODO do an authentication, get the user from the wallet, if it's not in the wallet
   then return null user info object, otherwise return user info.
   The wallet is saving user under the wallet<network name>/<user name> directory,
   see variable this.FSWALLET in  block chain-explorer/app/platform/fabric/gateway/FabricGateway.js
    */

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof UserService
	 */
	async authenticate(user) {
		let enableAuth = false;
		let adminUser = null;
		let adminPassword = null;
		if (user.user && user.password && user.network) {
			logger.log('user.network ', user.network);
			const network = this.platform.getNetworks().get(user.network);

			// TODO, need review maybe there is a better way to get the client config enableAuthentication
			for (const [network_name, clients] of network.entries()) {
				if (clients.config && clients.config.client) {
					enableAuth = clients.config.client.enableAuthentication;
					if (typeof enableAuth !== 'undefined' && enableAuth !== null) {
						logger.log(`Network: ${network_name} enableAuthentication ${enableAuth}`);
						console.log(
							`Network: ${network_name} enableAuthentication ${enableAuth}`
						);
						adminUser = clients.config.client.adminUser;
						adminPassword = clients.config.client.adminPassword;
						break;
					}
				}
			}

			// Skip authentication, if set to false in connection profile, key: enableAuthentication
			if (!enableAuth) {
				return {
					authenticated: true,
					user: user.user,
					enableAuthentication: enableAuth
				};
			}

			// For now validate only for the admin user
			if (user.user === adminUser && user.password === adminPassword) {
				return {
					authenticated: true,
					user: user.user,
					enableAuthentication: enableAuth
				};
			} else {
				return {
					authenticated: false,
					user: user.user,
					message: 'Invalid user name, or password',
					enableAuthentication: enableAuth
				};
			}
		} else {
			return {
				authenticated: false,
				message: 'Invalid request, found ',
				user: user.user,
				enableAuthentication: enableAuth
			};
		}
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof UserService
	 */
	async register(user) {
		/* TODO
    1. verify if user exists
    2. register user if doesn't exist
    3. depending on the user type use either enrollUserIdentity, or  enrollCaIdentity*/
		try {
			var username = user['user'];
			var fabricClient = this.platform.getClient();
			var fabricGw = fabricClient.fabricGateway;
			var userOrg = fabricClient.config.client.organization;
			var isExist = await fabricGw.wallet.exists(username);

			if (isExist) {
				throw new Error('already exists');
			} else {
				if (fabricGw.fabricCaEnabled) {
					var caURL;
					var serverCertPath;
					({
						caURL,
						serverCertPath
					} = fabricGw.fabricConfig.getCertificateAuthorities());
					let ca = new FabricCAServices(caURL[0]);

					let adminUserObj = await fabricClient.hfc_client.setUserContext({
						username: fabricGw.fabricConfig.getAdminUser(),
						password: fabricGw.fabricConfig.getAdminPassword()
					});
					let secret = await ca.register(
						{
							enrollmentID: username,
							enrollmentSecret: user['password'],
							affiliation: [userOrg.toLowerCase(), user['affiliation']].join('.'),
							role: user['roles']
						},
						adminUserObj
					);
					logger.debug('Successfully got the secret for user %s', username);
				} else {
					throw new Error('did not register with CA');
				}

				const identity = await this.enrollCaIdentity(user);
				await this.reconnectGw(user, identity);
			}
		} catch (error) {
			return {
				status: 400,
				message: error.toString()
			};
		}
		return {
			status: 200
		};
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof UserService
	 */
	async enroll(user) {
		try {
			logger.debug('UserService::enroll');
			const identity = await this.enrollCaIdentity(user);
			await this.reconnectGw(user, identity);
		} catch (error) {
			return {
				status: 400,
				message:
					'Failed to get enrolled user: ' +
					user['user'] +
					' with error: ' +
					error.toString()
			};
		}
		return {
			status: 200
		};
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof UserService
	 */
	async enrollCaIdentity(user) {
		/* TODO should have the same logic as the method in _enrollCaIdentity of
      block chain-explorer/app/platform/fabric/gateway/FabricGateway.js
      FabricGateway enrolls a CA ( Certificate Authority) Identity that is defined in the config.json,
      but we may need enroll a CA entry form to enroll a CA
    */
		logger.debug('enrollCaIdentity: ', user);
		var username = user['user'];
		var fabricClient = this.platform.getClient();
		var fabricGw = fabricClient.fabricGateway;
		var isExist = await fabricGw.wallet.exists(username);
		if (isExist) {
			// Throw new Error('Failed to enroll: Not found identity in wallet, ' + err.toString());
			const identity = await fabricGw.wallet.export(username);
			// Await reconnectGw(user, identity);
			return identity;
		} else {
			try {
				var caURL;
				var serverCertPath;
				({
					caURL,
					serverCertPath
				} = fabricGw.fabricConfig.getCertificateAuthorities());
				let ca = new FabricCAServices(caURL[0]);
				const enrollment = await ca.enroll({
					enrollmentID: username,
					enrollmentSecret: user['password']
				});

				// Import identity wallet
				var identity = X509WalletMixin.createIdentity(
					fabricGw.mspId,
					enrollment.certificate,
					enrollment.key.toBytes()
				);
				await fabricGw.wallet.import(username, identity);
				logger.debug(
					'Successfully get user enrolled and imported to wallet, ',
					username
				);
				return identity;
			} catch (err) {
				logger.error('Failed to enroll %s', username);
				throw new Error(
					'Failed to enroll user: ' + user['user'] + ' with error: ' + err.toString()
				);
			}
		}
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @param {*} identity
	 * @memberof UserService
	 */
	async reconnectGw(user, identity) {
		try {
			logger.debug('reconnectGw: ', user);
			var username = user['user'];
			var fabricClient = this.platform.getClient();
			var fabricGw = fabricClient.fabricGateway;

			// Set connection options; identity and wallet
			let connectionOptions = {
				identity: username,
				mspId: identity.mspId,
				wallet: fabricGw.wallet,
				discovery: {
					enabled: true,
					asLocalhost: fabricClient.asLocalhost
				},
				clientTlsIdentity: username,
				eventHandlerOptions: {
					commitTimeout: 100
				}
			};

			fabricGw.gateway.disconnect();

			// Connect to gateway
			await fabricGw.gateway.connect(
				fabricGw.config,
				connectionOptions
			);
			logger.debug('Successfully reconnected with ', username);
		} catch (err) {
			throw new Error('Failed to reconnect: ' + err.toString());
		}
	}
}

module.exports = UserService;
