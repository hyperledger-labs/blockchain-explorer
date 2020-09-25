/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable quotes */
/* eslint-disable no-extra-parens */

import * as bcrypt from 'bcrypt';
import { helper } from '../../../common/helper';
import * as UserMeta from '../../../model/User';

const logger = helper.getLogger('UserService');

/**
 *
 *
 * @class UserService
 */
export class UserService {
	platform: any;
	userDataService: any;

	/**
	 *Creates an instance of UserService.
	 * @param {*} platform
	 * @memberof UserService
	 */
	constructor(platform) {
		this.platform = platform;
		this.userDataService = platform.getPersistence().getUserDataService();
		this.userDataService.initialize(UserMeta.attributes, UserMeta.options);
	}

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
			logger.error(`Failed to get client object for ${user.network}`);
			return false;
		}

		const client = clientObj.instance;
		const fabricConfig = client.fabricGateway.fabricConfig;
		enableAuth = fabricConfig.getEnableAuthentication();
		// Skip authentication, if set to false in connection profile, key: enableAuthentication
		if (!enableAuth) {
			logger.info('Skip authentication');
			return true;
		}

		logger.info(`Network: ${user.network} enableAuthentication ${enableAuth}`);

		return this.userDataService
			.findUser(user.user, user.network)
			.then(userEntry => {
				if (userEntry == null) {
					logger.error(`Incorrect credential : ${user.user} in ${user.network}`);
					return false;
				}

				const hashedPassword = bcrypt.hashSync(user.password, userEntry.salt);
				if (userEntry.password === hashedPassword) {
					return true;
				}

				logger.error(`Incorrect credential : ${user.user} in ${user.network}`);
				return false;
			});
	}

	/**
	 *
	 *
	 * @param {User} userObj
	 * @returns
	 * @memberof UserService
	 */
	getAdminUser(userObj) {
		const clientObj = this.platform.getNetworks().get(userObj.network);
		if (!clientObj) {
			throw new Error(`Failed to get client object for ${userObj.network}`);
		}

		const client = clientObj.instance;
		const fabricConfig = client.fabricGateway.fabricConfig;
		return fabricConfig.getAdminUser();
	}

	/**
	 *
	 *
	 * @param {User} userObj
	 * @returns {boolean} Return true if specified user has admin privilege
	 * @memberof UserService
	 */
	isAdminRole(userObj) {
		if (!userObj.requestUserId) {
			// That means it's requested internally
			return true;
		}
		logger.info('isAdminRole:', userObj);
		return this.userDataService
			.findUser(userObj.requestUserId, userObj.network)
			.then(userEntry => {
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
			if (!(await this.isAdminRole(user))) {
				throw new Error("Permission error : can't register user");
			}
			await this.userDataService
				.findUser(user.user, user.network)
				.then(async userEntry => {
					if (userEntry != null) {
						throw new Error('already exists');
					}

					const salt = bcrypt.genSaltSync(10);
					const hashedPassword = bcrypt.hashSync(user.password, salt);
					const newUser = {
						username: user.user,
						salt: salt,
						password: hashedPassword,
						networkName: user.network,
						firstName: user.firstname,
						lastName: user.lastname,
						email: user.email ? user.email : null,
						roles: user.roles
					};

					await this.userDataService
						.registerUser(newUser)
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

			if (!(await this.isAdminRole(user))) {
				throw new Error("Permission error : can't unregister user");
			}

			if (user.user === user.requestUserId) {
				throw new Error("Permission error : can't unregister by yourself");
			}

			if (user.user === this.getAdminUser(user)) {
				throw new Error("Permission error : can't unregister root admin user");
			}

			await this.userDataService
				.findUser(user.user, user.network)
				.then(async userEntry => {
					if (userEntry == null) {
						throw new Error(`${user.user} does not exists`);
					}

					await this.userDataService
						.unregisterUser(user.user, user.network)
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

	/**
	 *
	 *
	 * @param {*} user
	 * @returns {Object} Object including status and array of user entry
	 * @memberof UserService
	 */
	async userlist(user) {
		let userList = [];
		try {
			userList = await this.userDataService.getUserlist(user.network);
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
	 * @param {string} user
	 * @param {string} network
	 * @returns {boolean} Return true if specified user has already existed in the specified network
	 * @memberof UserService
	 */
	isExist(user, network) {
		return this.userDataService.findUser(user, network).then(userEntry => {
			if (userEntry !== null) {
				return true;
			}
			return false;
		});
	}
}
