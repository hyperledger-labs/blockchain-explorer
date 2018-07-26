/*
*SPDX-License-Identifier: Apache-2.0
*/

var Persist = require('./postgreSQL/Persist_1.2.0');

class PersistenceFactory {
  static async create(db) {
    console.log(db);

    if (db === 'postgreSQL') {
      var persist = new Persist();
      await persist.initialize();
      return persist;
    }

    throw 'Persistence implementation is not found for ' + db;
  }
}

module.exports = PersistenceFactory;
