/**
 *    SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

import reducers from './reducers';
import actions from './actions';

describe('Theme Reducer', () => {
	it('should return the initial state', () => {
		expect(reducers(undefined, {})).toEqual({
			mode: 'light'
		});
	});

	it('should display the theme based on the action passed', () => {
		const initialState = {};
		const payload = { mode: 'light' };
		const action = actions.changeTheme(payload);

		const newState = reducers(initialState, action);
		expect(newState.mode).toEqual({ mode: 'light' });
	});
});
