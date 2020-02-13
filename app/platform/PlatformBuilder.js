/*
 *SPDX-License-Identifier: Apache-2.0
 */

const explorer_const = require('../common/ExplorerConst').explorer.const;
const explorer_error = require('../common/ExplorerMessage').explorer.error;
const ExplorerError = require('../common/ExplorerError');

/**
 *
 *
 * @class PlatformBuilder
 */
class PlatformBuilder {
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
		if (pltfrm === explorer_const.PLATFORM_FABRIC) {
			const Platform = require('./fabric/Platform');
			const platform = new Platform(persistence, broadcaster);
			return platform;
		}
		throw new ExplorerError(explorer_error.ERROR_1004, pltfrm);
	}
}

module.exports = PlatformBuilder;
