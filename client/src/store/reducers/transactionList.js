/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'
import moment from 'moment-timezone';

const InitialState = new Record({
    loaded: false,
    transactionList: [],
    errors: {},

})

const transactionList = handleActions({
    [actionTypes.TX_LIST]: (state = InitialState(), action) => {
        action.payload.rows.forEach( element => {
            element.createdt = moment(element.createdt).tz(moment.tz.guess()).format("M-D-YYYY h:mm A zz")
        })
        return (
        state
        .set('transactionList', action.payload)
        .set('loaded', true)
        .set('errors', action.error)
        )
}
}, new InitialState());

export default transactionList
