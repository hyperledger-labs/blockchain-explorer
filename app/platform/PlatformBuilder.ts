/*
 *SPDX-License-Identifier: Apache-2.0
 */

import {explorerConst} from '../common/ExplorerConst'
import {explorerError} from '../common/ExplorerMessage'
const ExplorerError = require('../common/ExplorerError');

/**
 *
 *
 * @class PlatformBuilder
 */
export class PlatformBuilder {
	/**
	 *
	 *
	 * @static
	 * @param {*} pltfrm
	 * @param {*} persistence
	 * @param {*} broadcaster
	 * @returns
	 * @memberof PlatformBuilder
	 */
	static async build(pltfrm, persistence, broadcaster) {
		if (pltfrm === explorerConst.PLATFORM_FABRIC) {
			const Platform = require('./fabric/Platform');
			const platform = new Platform(persistence, broadcaster);
			return platform;
		}
		throw new ExplorerError(explorerError.ERROR_1004, pltfrm);
	}
}
