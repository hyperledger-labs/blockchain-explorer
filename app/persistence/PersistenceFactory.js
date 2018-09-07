/*
*SPDX-License-Identifier: Apache-2.0
*/
var explorer_const = require('../common/ExplorerConst').explorer.const;
var explorer_error = require('../common/ExplorerMessage').explorer.error;
var ExplorerError = require('../common/ExplorerError');

class PersistenceFactory {
  static async create(db, dbconfig) {
    if (db === explorer_const.PERSISTENCE_POSTGRESQL) {
      //avoid to load all db Persist module
      var PostgreSQL = require('./postgreSQL/Persist');
      let persistence = new PostgreSQL(dbconfig);
      await persistence.getPGService().handleDisconnect();
      return persistence;
    }
    throw new ExplorerError(explorer_error.ERROR_1003, db);
  }
}

module.exports = PersistenceFactory;
