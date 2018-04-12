
/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions';
import { Record } from 'immutable';
import * as actionTypes from '../actions/action-types';

const InitialState = new Record({
    loaded: false,
    countHeader: [],
    errors: {},
});

const countHeader = handleActions({
    [actionTypes.COUNT_HEADER_POST]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('countHeader', action.payload)
        .set('errors', action.error),

}, new InitialState());

export default countHeader