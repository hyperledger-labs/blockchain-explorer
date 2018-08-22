/*
*SPDX-License-Identifier: Apache-2.0
*/

var Persist = require('./postgreSQL/Persist.js');

class PersistenceFactory {
  static async create(db) {
    if (db == 'postgreSQL') {
      var persist = new Persist();
      await persist.initialize();
      return persist;
    }

    throw 'Invalid Platform';
  }
}

module.exports = PersistenceFactory;
