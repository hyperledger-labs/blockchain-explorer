/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { helper } from './helper';

const logger = helper.getLogger('ForkSenderHandler');

/**
 * Returns the number of milliseconds between midnight,
 * January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
 *
 * @param {*} dateStr
 * @returns
 */

export function toUTCmilliseconds(dateStr: any) {
	let startSyncMills = null;
	try {
		startSyncMills = Date.parse(dateStr);
	} catch (err) {
		logger.error('Unparsable date format, dateStr= ', dateStr, ' ', err);
	}
	return startSyncMills;
}
