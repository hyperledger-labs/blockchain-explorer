/*
 * SPDX-License-Identifier: Apache-2.0
 */

import util from 'util';

/**
 *
 * @param {*} args {
 * %s - String.
 * %d - Number (both integer and float).
 * %j - JSON.
 * %% - single percent sign ('%'). This does not consume an argument.
 * }
 */
export function ExplorerError(...args: string[]) {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = util.format(args);
}
