/*
 *SPDX-License-Identifier: Apache-2.0
 */

const helper = require('../../../common/helper');

const logger = helper.getLogger('FabricGateway');

/**
 *
 *
 * @class User
 */
class User {
	/**
	 * Creates an instance of User.
	 * @param {*} user
	 * @memberof User
	 */
	constructor(user) {
		// Put the user request in user object
		this.userJson = {};
		Object.keys(user).forEach(key => {
			const value = user[key];
			this.userJson[key] = value;
			logger.log('User.constructor ', key, '= ', value);
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

module.exports = User;
