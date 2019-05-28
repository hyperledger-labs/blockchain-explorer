/*
 *SPDX-License-Identifier: Apache-2.0
 */
const explorer_const = require('../common/ExplorerConst').explorer.const;
const explorer_error = require('../common/ExplorerMessage').explorer.error;
const ExplorerError = require('../common/ExplorerError');
const PostgreSQL = require('./postgreSQL/Persist');

class PersistenceFactory {
  static async create(db, dbconfig) {
    if (db === explorer_const.PERSISTENCE_POSTGRESQL) {
      // avoid to load all db Persist module
      const persistence = new PostgreSQL(dbconfig);
      await persistence.getPGService().handleDisconnect();
      return persistence;
    }
    throw new ExplorerError(explorer_error.ERROR_1003, db);
  }
}

module.exports = PersistenceFactory;
