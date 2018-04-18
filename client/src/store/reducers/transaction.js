/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions';
import { Record } from 'immutable';
import * as actionTypes from '../actions/action-types';

const InitialState = new Record({
    loaded: false,
    transaction: {},
    errors: {},
});

const transaction = handleActions({
    [actionTypes.TRANSACTION_POST]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('transaction', action.payload.row)
        .set('errors', action.error),

}, new InitialState());

export default transaction