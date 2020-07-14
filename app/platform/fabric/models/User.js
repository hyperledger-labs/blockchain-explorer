/*
 *SPDX-License-Identifier: Apache-2.0
 */

const helper = require('../../../common/helper');

const logger = helper.getLogger('User');

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
		logger.debug(`User : ${user.user}`);
		Object.keys(user).forEach(key => {
			const value = user[key];
			this.userJson[key] = value;
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
