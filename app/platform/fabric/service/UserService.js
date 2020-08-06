/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

const fs = require('fs');
const bcrypt = require('bcrypt');
const FabricCAServices = require('fabric-ca-client');

const User = require('../models/User');
const helper = require('../../../common/helper');
const logger = helper.getLogger('UserService');
const Model = require('../../../model/model');

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

		if (!user.user || !user.password || !user.network) {
			logger.error('Invalid parameters');
			return false;
		}

		logger.info('user.network ', user.network);
		const clientObj = this.platform.getNetworks().get(user.network);
		if (!clientObj) {
			logger.error(`Faied to get client object for ${user.network}`);
			return false;
		}

		let client = clientObj.instance;
		const fabricConfig = client.fabricGateway.fabricConfig;
		enableAuth = fabricConfig.getEnableAuthentication();
		// Skip authentication, if set to false in connection profile, key: enableAuthentication
		if (!enableAuth) {
			logger.info('Skip authentication');
			return true;
		}

		logger.info(`Network: ${user.network} enableAuthentication ${enableAuth}`);

		return Model.User.findOne({
			where: {
				username: `${user.network}-${user.user}`
			}
		}).then(userEntry => {
			if (userEntry == null) {
				logger.error(`Incorrect credential : ${user.user} in ${user.network}`);
				return false;
			}

			var hashedPassword = bcrypt.hashSync(user.password, userEntry.salt);
			if (userEntry.password === hashedPassword) {
				return true;
			}

			logger.error(`Incorrect credential : ${user.user} in ${user.network}`);
			return false;
		});
	}

	getAdminUser(userObj) {
		const clientObj = this.platform.getNetworks().get(userObj.network);
		if (!clientObj) {
			throw new Error(`Faied to get client object for ${userObj.network}`);
		}

		let client = clientObj.instance;
		const fabricConfig = client.fabricGateway.fabricConfig;
		return fabricConfig.getAdminUser();
	}

	isAdminRole(userObj) {
		const combinedUserName = `${userObj.network}-${userObj.requestUserId}`;
		return Model.User.findOne({
			where: {
				username: combinedUserName
			}
		}).then(userEntry => {
			if (userEntry === null) {
				throw new Error(
					`User who requests doesn't exist : ${userObj.requestUserId}`
				);
			}
			return userEntry.roles === 'admin';
		});
	}
	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 * @memberof UserService
	 */
	async register(user) {
		try {
			if (!user.user || !user.password || !user.network) {
				throw new Error('Invalid parameters');
			}
			const combinedUserName = `${user.network}-${user.user}`;

			if (!(await this.isAdminRole(user))) {
				throw new Error(`Permission error : can't register user`);
			}

			await Model.User.findOne({
				where: {
					username: combinedUserName
				}
			}).then(async userEntry => {
				if (userEntry != null) {
					throw new Error('already exists');
				}

				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(user.password, salt);
				const newUser = {
					username: combinedUserName,
					salt: salt,
					password: hashedPassword,
					networkName: user.network,
					firstName: user.firstname,
					lastName: user.lastname,
					email: user.email ? user.email : null,
					roles: user.roles
				};

				await Model.User.create(newUser)
					.then(() => {
						return true;
					})
					.catch(error => {
						throw new Error(`Failed to register user : ${user.user} : ${error}`);
					});
			});
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
	async unregister(user) {
		try {
			if (!user.user || !user.network) {
				throw new Error('Invalid parameters');
			}
			const combinedUserName = `${user.network}-${user.user}`;

			if (!(await this.isAdminRole(user))) {
				throw new Error(`Permission error : can't unregister user`);
			}

			if (user.user === user.requestUserId) {
				throw new Error(`Permission error : can't unregister by yourself`);
			}

			if (user.user === this.getAdminUser(user)) {
				throw new Error(`Permission error : can't unregister root admin user`);
			}

			await Model.User.findOne({
				where: {
					username: combinedUserName
				}
			}).then(async userEntry => {
				if (userEntry == null) {
					throw new Error(`${user.user} does not exists`);
				}

				const newUser = {
					where: {
						username: combinedUserName
					}
				};

				await Model.User.destroy(newUser)
					.then(() => {
						return true;
					})
					.catch(error => {
						throw new Error(`Failed to unRegister user : ${user.user} : ${error}`);
					});
			});
		} catch (error) {
			return {
				status: 400,
				message: error.toString()
			};
		}
		return {
			status: 200,
			message: 'Unregistered successfully!'
		};
	}

	async userlist() {
		var userList = [];
		try {
			await Model.User.findAll()
				.then(users => {
					users.forEach(user => {
						userList.push({
							username: user.username,
							email: user.email,
							networkName: user.networkName,
							firstName: user.firstName,
							lastName: user.lastName,
							roles: user.roles
						});
					});
					return true;
				})
				.catch(error => {
					throw new Error(`Failed to get all users : ${error}`);
				});
		} catch (error) {
			return {
				status: 400,
				message: error.toString()
			};
		}
		return {
			status: 200,
			message: userList
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
