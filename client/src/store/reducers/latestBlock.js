/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from 'redux-actions';
import { Record } from 'immutable';
import * as actionTypes from '../actions/action-types';

const InitialState = new Record({
    loaded: false,
    latestBlock: {},
    errors: {},
});

const latestBlock = handleActions({
    [actionTypes.LATEST_BLOCK]: (state = InitialState(), action) => state
        .set('loaded', true)
        .set('latestBlock', action.payload)
        .set('errors', action.error),

}, new InitialState());

export default latestBlock