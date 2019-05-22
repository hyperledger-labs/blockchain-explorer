/*
 *SPDX-License-Identifier: Apache-2.0
 */
const explorer_const = require('../common/ExplorerConst').explorer.const;
const explorer_error = require('../common/ExplorerMessage').explorer.error;
const ExplorerError = require('../common/ExplorerError');

/**
 *
 *
 * @class PersistenceFactory
 */
class PersistenceFactory {
	/**
	 *
	 *
	 * @static
	 * @param {*} db
	 * @param {*} dbconfig
	 * @returns
	 * @memberof PersistenceFactory
	 */
	static async create(db, dbconfig) {
		if (db === explorer_const.PERSISTENCE_POSTGRESQL) {
			// Avoid to load all db Persist module
			const PostgreSQL = require('./postgreSQL/Persist');
			const persistence = new PostgreSQL(dbconfig);
			await persistence.getPGService().handleDisconnect();
			return persistence;
		}
		throw new ExplorerError(explorer_error.ERROR_1003, db);
	}
}

module.exports = PersistenceFactory;
