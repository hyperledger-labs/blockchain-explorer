/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { explorerConst } from '../common/ExplorerConst';
import { explorerError } from '../common/ExplorerMessage';
import { ExplorerError } from '../common/ExplorerError';
import { Persist } from './postgreSQL/Persist';

/**
 *
 *
 * @class PersistenceFactory
 */
export class PersistenceFactory {
	/**
	 *
	 *
	 * @static
	 * @param {*} db
	 * @param {*} dbconfig
	 * @returns
	 * @memberof PersistenceFactory
	 */
	static async create(db: string, dbconfig: any) {
		if (db === explorerConst.PERSISTENCE_POSTGRESQL) {
			// Avoid to load all db Persist module
			const persistence = new Persist(dbconfig);
			await persistence.getPGService().handleDisconnect();
			return persistence;
		}
		throw new ExplorerError(explorerError.ERROR_1003, db);
	}
}
