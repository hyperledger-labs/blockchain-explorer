/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
	'postgres://postgres:postgres@localhost:5432/fabricexplorer',
	{ logging: false }
);

module.exports = sequelize;
