/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const UserMeta = require('./User.js');
const connection = require('../sequelize/sequelize.js');

const User = connection.define('users', UserMeta.attributes, UserMeta.options);

// you can define relationships here
module.exports.User = User;
