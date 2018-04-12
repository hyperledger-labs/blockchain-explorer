/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducers from './reducers/index'

export default (initialState = {}) => {
    const store = createStore(
        rootReducers,
        initialState,
        applyMiddleware(thunk)
    )
    return store;
}