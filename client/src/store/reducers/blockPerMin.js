/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    blockPerMin: [],
    errors: {},

})

const blockPerMin = handleActions({
    [actionTypes.BLOCK_CHART_MIN]: (state = InitialState(), action) => state
        .set('blockPerMin', action.payload)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default blockPerMin
