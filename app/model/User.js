/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const Sequelize = require('sequelize');

const attributes = {
	username: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		validate: {
			is: {
				args: /^[a-z0-9_-]+$/i,
				msg:
					'Username allows only lowercase alphanumeric characters with hyphen and underscore Ex:(a-z0-9_-)'
			}
		}
	},
	email: {
		type: Sequelize.STRING,
		validate: {
			isEmail: {
				args: true,
				msg: 'Invalid email format'
			}
		}
	},
	networkName: {
		type: Sequelize.STRING,
		allowNull: false
	},
	firstName: {
		type: Sequelize.STRING
	},
	lastName: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	},
	roles: {
		type: Sequelize.STRING
	},
	salt: {
		type: Sequelize.STRING
	}
};

const options = {
	freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;
