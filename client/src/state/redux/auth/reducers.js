/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

const initialState = {
	user: '',
	token: null,
	error: '',
	networks: [],
	registered: ''
};

/* Reducers for Dashboard Charts */
const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.LOGIN: {
			return {
				...state,
				...action.payload
			};
		}
		case types.ERROR: {
			return {
				...state,
				...action.payload
			};
		}
		case types.NETWORK: {
			return {
				...state,
				...action.payload
			};
		}
		case types.REGISTER: {
			return {
				...state,
				...action.payload
			};
		}
		default: {
			return state;
		}
	}
};

export default authReducer;
