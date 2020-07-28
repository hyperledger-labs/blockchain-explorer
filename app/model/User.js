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
			is: /^[a-z0-9_-]+$/i
		}
	},
	email: {
		type: Sequelize.STRING,
		validate: {
			isEmail: true
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
