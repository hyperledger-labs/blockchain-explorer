/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import * as Sequelize from 'sequelize';

export const attributes = {
	username: {
		type: Sequelize.DataTypes.STRING,
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
		type: Sequelize.DataTypes.STRING,
		validate: {
			isEmail: {
				args: true,
				msg: 'Invalid email format'
			}
		}
	},
	networkName: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	},
	firstName: {
		type: Sequelize.DataTypes.STRING
	},
	lastName: {
		type: Sequelize.DataTypes.STRING
	},
	password: {
		type: Sequelize.DataTypes.STRING
	},
	roles: {
		type: Sequelize.DataTypes.STRING
	},
	salt: {
		type: Sequelize.DataTypes.STRING
	}
};

export const options = {
	freezeTableName: true,
	indexes: [
		{
			unique: true,
			fields: ['username', 'networkName']
		}
	]
};
