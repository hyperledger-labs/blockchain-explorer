/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    channels: [],
    errors: {}
})


const channels = handleActions({
    [actionTypes.CHANNELS]: (state = InitialState(), action) => state
        .set('channels', action.payload)
        .set('loaded', true)
        .set('errors', action.error),

}, new InitialState())

/*const sampleCallBack = (state, action) => {
    return { state: channel, ...action.payload };
}*/
export default channels