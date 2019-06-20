/**
 *    SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

import reducers from './reducers';
import actions from './actions';
import * as selectors from './selectors';

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

describe('Theme Selector', () => {
	test('chaincodeListSelector', () => {
		const state = { theme: { mode: 'test' } };
		const selectTheme = selectors.modeSelector(state);
		expect(selectTheme).toBe('test');
	});
});
