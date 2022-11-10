/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

const initialState = {
	drawerOpen: true
};

/* Reducers for Dashboard Charts */
const themeReducer = (state = initialState, action = {}) => {
	if (action.type === types.TOGGLE_DRAWER) {
		return {
			...state,
			drawerOpen: !state.drawerOpen
		};
	} else {
		return state;
	}
};

export default themeReducer;
