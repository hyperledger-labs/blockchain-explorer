/*
    SPDX-License-Identifier: Apache-2.0
*/

/** **
 *  Returns the number of milliseconds between midnight,
 *  January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
 *
 */

const helper = require('./helper');

const logger = helper.getLogger('commonUtils');

function toUTCmilliseconds(dateStr) {
  let startSyncMills = null;
  try {
    startSyncMills = Date.parse(dateStr);
  } catch (err) {
    logger.error('Unparsable date format, dateStr= ', dateStr, ' ', err);
  }
  return startSyncMills;
}

exports.toUTCmilliseconds = toUTCmilliseconds;
