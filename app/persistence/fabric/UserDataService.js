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
	 * @param {string} userID
	 * @param {string} network
	 * @returns {string} Actually registered User ID
	 * @memberof UserDataService
	 */
	getRegisterUserID(userID, network) {
		// To ensure that user ID needs to be unique within each network
		return `${network}-${userID}`;
	}

	/**
	 *
	 *
	 * @param {string} registeredUserID
	 * @param {string} network
	 * @returns {string} User ID stripped network name
	 * @memberof UserDataService
	 */
	getOriginalUserID(registeredUserID, network) {
		return registeredUserID.split(`${network}-`).join('');
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
	 * @param {string} user
	 * @param {string} network
	 * @returns {*} User model
	 * @memberof UserDataService
	 */
	findUser(user, network) {
		return this.userModel.findOne({
			where: {
				username: this.getRegisterUserID(user, network)
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
		newUserObj.username = this.getRegisterUserID(
			newUserObj.username,
			newUserObj.networkName
		);
		return this.userModel.create(newUserObj);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {User} network
	 * @returns {Promise} Promise of the number of destroyed users
	 * @memberof UserDataService
	 */
	unregisterUser(user, network) {
		const unregisterUser = {
			where: {
				username: this.getRegisterUserID(user, network)
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
					username: this.getOriginalUserID(user.username, user.networkName),
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
