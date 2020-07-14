/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

const fs = require('fs');

const User = require('../models/User');
const helper = require('../../../common/helper');
const logger = helper.getLogger('UserService');

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
			logger.info('user.network ', user.network);
			const clientObj = this.platform.getNetworks().get(user.network);

			if (!clientObj) {
				const errMsg = `Faied to get client object for ${user.network}`;
				logger.error(errMsg);
				return {
					authenticated: false,
					user: user.user,
					message: `Internal error: ${errMsg}`,
					enableAuthentication: enableAuth,
					network: user.network
				};
			}

			let client = clientObj.instance;
			const fabricConfig = client.fabricGateway.fabricConfig;
			enableAuth = fabricConfig.getEnableAuthentication();
			if (enableAuth) {
				logger.info(`Network: ${user.network} enableAuthentication ${enableAuth}`);
				adminUser = fabricConfig.getAdminUser();
				adminPassword = fabricConfig.getAdminPassword();

				// Not authorized if credentials are incomplete in auth enabled mode
				if (!adminUser || !adminPassword) {
					const errMsg = `Faied authentication for ${user.network}`;
					logger.error(errMsg);
					return {
						authenticated: false,
						user: user.user,
						message: `Internal error: ${errMsg}`,
						enableAuthentication: enableAuth,
						network: user.network
					};
				}
			}

			// Skip authentication, if set to false in connection profile, key: enableAuthentication
			if (!enableAuth) {
				return {
					authenticated: true,
					user: user.user,
					enableAuthentication: enableAuth,
					network: user.network
				};
			}

			// For now validate only for the admin user
			if (user.user === adminUser && user.password === adminPassword) {
				return {
					authenticated: true,
					user: user.user,
					enableAuthentication: enableAuth,
					network: user.network
				};
			} else {
				return {
					authenticated: false,
					user: user.user,
					message: 'Invalid user name, or password',
					enableAuthentication: enableAuth,
					network: user.network
				};
			}
		} else {
			return {
				authenticated: false,
				user: user.user,
				message: 'Invalid request',
				enableAuthentication: enableAuth,
				network: user.network
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
			var fabricClient = this.platform.getClient();
			var fabricGw = fabricClient.fabricGateway;
			var userOrg = fabricClient.config.client.organization;
			var isExist = await fabricGw.wallet.get(user['user']);

			if (isExist) {
				throw new Error('already exists');
			} else {
				if (fabricGw.fabricCaEnabled) {
					const caConfig = fabricGw.fabricConfig.getCertificateAuthorities();
					const tlsCACert = fs.readFileSync(caConfig.serverCertPath, 'utf8');
					const ca = new FabricCAServices(caConfig.caURL[0], {
						trustedRoots: tlsCACert,
						verify: false
					});

					const adminUserName = fabricGw.fabricConfig.getAdminUser();
					const adminUserObj = await fabricGw.getUserContext(adminUserName);

					let secret = await ca.register(
						{
							enrollmentID: user['user'],
							enrollmentSecret: user['password'],
							affiliation: [userOrg.toLowerCase(), user['affiliation']].join('.'),
							role: user['roles']
						},
						adminUserObj
					);

					logger.debug('Successfully got the secret for user %s', user['user']);
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
		var identity = await fabricGw.wallet.get(username);
		if (identity) {
			return identity;
		} else {
			try {
				identity = await fabricGw.enrollCaIdentity(user['user'], user['password']);
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
			await fabricGw.gateway.connect(fabricGw.config, connectionOptions);
			logger.debug('Successfully reconnected with ', username);
		} catch (err) {
			throw new Error('Failed to reconnect: ' + err.toString());
		}
	}
}

module.exports = UserService;
