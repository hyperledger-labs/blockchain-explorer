/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    peerList: [],
    errors: {},

})

const peerList = handleActions({
    [actionTypes.PEER_LIST_POST]: (state = InitialState(), action) => state
        .set('peerList', action.payload.peers)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default peerList
