/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import * as reducers from './redux';
import Auth from './Auth';

export default function configureStore(initialState) {
	const token = Auth.getToken();
	const rootReducer = combineReducers(reducers);

	return createStore(
		rootReducer,
		{ ...initialState, auth: { token } },
		applyMiddleware(thunkMiddleware)
	);
}
