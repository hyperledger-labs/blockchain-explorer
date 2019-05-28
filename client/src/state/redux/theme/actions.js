/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

export const changeTheme = mode => ({
	type: types.CHANGE_THEME,
	payload: { mode }
});

export default {
	changeTheme
};
