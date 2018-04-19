/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    transactionList: [],
    errors: {},

})

const transactionList = handleActions({
    [actionTypes.TX_LIST]: (state = InitialState(), action) => {
        action.payload.rows.forEach( element => {
            element.read_set = JSON.stringify(element.read_set);
            element.write_set = JSON.stringify(element.write_set)
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
