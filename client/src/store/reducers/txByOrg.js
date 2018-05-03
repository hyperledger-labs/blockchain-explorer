/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    txByOrg: [],
    errors: {},

})

const txByOrg = handleActions({
    [actionTypes.TX_CHART_ORG]: (state = InitialState(), action) => state
        .set('txByOrg', action.payload.rows)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default txByOrg
