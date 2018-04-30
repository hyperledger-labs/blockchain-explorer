/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions';
import { Record } from 'immutable';
import * as actionTypes from '../actions/action-types';

const InitialState = new Record({
    loaded: false,
    notification: {},
    errors: {},
});

const notification = handleActions({
    [actionTypes.NOTIFICATION_LOAD]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('notification', action.payload)
        .set('errors', action.error),

}, new InitialState());

export default notification