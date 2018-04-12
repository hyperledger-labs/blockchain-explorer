/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    channelList: {},
    errors: {},

})


const channelList = handleActions({
    [actionTypes.CHANNEL_LIST]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('channelList', action.payload)
        .set('errors', action.error),
}, new InitialState())

export default channelList
