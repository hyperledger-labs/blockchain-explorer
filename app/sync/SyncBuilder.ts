/*
 *SPDX-License-Identifier: Apache-2.0
 */
import {explorer} from '../common/ExplorerConst'
import {explorer as explorerErr} from '../common/ExplorerMessage'
import ExplorerError from '../common/ExplorerError'

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
		if (pltfrm === explorer.const.PLATFORM_FABRIC) {
			const SyncPlatform = require('../platform/fabric/sync/SyncPlatform');
			const platform = new SyncPlatform(persistence, sender);
			return platform;
		}
		throw new ExplorerError(explorerErr.error.ERROR_1005, pltfrm);
	}
}

module.exports = SyncBuilder;
