/*
 *SPDX-License-Identifier: Apache-2.0
 */

import {helper} from '../../../common/helper';

const logger = helper.getLogger('User');

/**
 *
 *
 * @class User
 */
export class User {
	userJson : any;
	user: any;

	/**
	 * Creates an instance of User.
	 * @param {*} user
	 * @memberof User
	 */
	constructor(user) {
		// Put the user request in user object
		this.userJson = {};
		logger.debug(`User : ${user.user}`);
		Object.keys(user).forEach(key => {
			const value = user[key];
			this.userJson[key] = value;
		});
	}

	/**
	 *
	 * Create and return the User object by specifying minimum parameters
	 * @param {string} user
	 * @param {string} password
	 * @param {string} network
	 * @param {string} roles
	 * @returns {User} Newly defined User object
	 * @memberof User
	 */
	static createInstanceWithParam(user, password, network, roles) : any {
		return new User({
			user,
			password,
			network,
			roles
		});
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof User
	 */
	async asJson() {
		return this.userJson;
	}
}
