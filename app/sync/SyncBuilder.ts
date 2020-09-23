/*
 *SPDX-License-Identifier: Apache-2.0
 */
import {explorerConst} from '../common/ExplorerConst'
import {explorerError} from '../common/ExplorerMessage'
const ExplorerError = require('../common/ExplorerError');


/**
 *
 *
 * @class SyncBuilder
 */
class SyncBuilder {
	/**
	 *
	 *
	 * @static
	 * @param {*} pltfrm
	 * @param {*} persistence
	 * @param {*} sender
	 * @returns
	 * @memberof SyncBuilder
	 */
	static async build(pltfrm, persistence, sender) {
		if (pltfrm === explorerConst.PLATFORM_FABRIC) {
			const SyncPlatform = require('../platform/fabric/sync/SyncPlatform');
			const platform = new SyncPlatform(persistence, sender);
			return platform;
		}
		throw new ExplorerError(explorerError.ERROR_1005, pltfrm);
	}
}

module.exports = SyncBuilder;
