/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { explorerConst } from '../common/ExplorerConst';
import { explorerError } from '../common/ExplorerMessage';
import { ExplorerError } from '../common/ExplorerError';
import { Platform } from './fabric/Platform';

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
	static async build(pltfrm: string, persistence: any, broadcaster: any) {
		if (pltfrm === explorerConst.PLATFORM_FABRIC) {
			const platform = new Platform(persistence, broadcaster);
			return platform;
		}
		throw new ExplorerError(explorerError.ERROR_1004, pltfrm);
	}
}
