/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    chaincodes: [],
    errors: {},

})

const chaincodes = handleActions({
    [actionTypes.CHAINCODE_LIST]: (state = InitialState(), action) => state
        .set('chaincodes', action.payload.chaincode)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default chaincodes
