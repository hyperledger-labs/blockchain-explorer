/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions';
import { Record } from 'immutable';
import * as actionTypes from '../actions/action-types';

const InitialState = new Record({
    loaded: false,
    block: {},
    errors: {},
});

const block = handleActions({
    [actionTypes.BLOCK_INFO_POST]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('block', action.payload)
        .set('errors', action.error),

}, new InitialState());

export default block