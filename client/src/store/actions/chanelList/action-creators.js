/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';
export const getChannelList = () => dispatch => {
    get('/api/channels')
        .then(resp => {
            dispatch(createAction(actionTypes.CHANNEL_LIST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

