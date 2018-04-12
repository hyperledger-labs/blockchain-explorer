/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    txPerHour: [],
    errors: {},

})

const txPerHour = handleActions({
    [actionTypes.TX_CHART_HOUR]: (state = InitialState(), action) => state
        .set('txPerHour', action.payload)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default txPerHour
