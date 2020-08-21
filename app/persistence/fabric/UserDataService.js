/**
 *    SPDX-License-Identifier: Apache-2.0
 */

/**
 *
 *
 * @class UserDataService
 */
class UserDataService {
	/**
	 * Creates an instance of UserDataService.
	 * @param {*} sql
	 * @memberof UserDataService
	 */
	constructor(sql) {
		this.sql = sql;
	}

	/**
	 *
	 *
	 * @param {*} attributes
	 * @param {*} options
	 * @memberof UserDataService
	 */
	async initialize(attributes, options) {
		this.userModel = this.sql.getUserModel(attributes, options);
	}

	/**
	 *
	 *
	 * @param {string} username
	 * @param {string} networkName
	 * @returns {*} User model
	 * @memberof UserDataService
	 */
	findUser(username, networkName) {
		return this.userModel.findOne({
			where: {
				username,
				networkName
			}
		});
	}

	/**
	 *
	 *
	 * @param {User} newUserObj
	 * @returns {Promise} Promise of User model
	 * @memberof UserDataService
	 */
	registerUser(newUserObj) {
		return this.userModel.create(newUserObj);
	}

	/**
	 *
	 *
	 * @param {User} username
	 * @param {User} networkName
	 * @returns {Promise} Promise of the number of destroyed users
	 * @memberof UserDataService
	 */
	unregisterUser(username, networkName) {
		const unregisterUser = {
			where: {
				username,
				networkName
			}
		};

		return this.userModel.destroy(unregisterUser);
	}

	/**
	 *
	 *
	 * @param {User} networkName
	 * @returns {Promise} Promise of the list of users belonging to specified network
	 * @memberof UserDataService
	 */
	getUserlist(networkName) {
		return this.userModel
			.findAll({
				where: {
					networkName
				}
			})
			.then(users => {
				return users.map(user => ({
					username: user.username,
					email: user.email,
					networkName: user.networkName,
					firstName: user.firstName,
					lastName: user.lastName,
					roles: user.roles
				}));
			});
	}
}

module.exports = UserDataService;
