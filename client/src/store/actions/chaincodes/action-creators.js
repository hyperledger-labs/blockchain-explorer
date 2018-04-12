/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';

export const getChaincodes = (channel) => dispatch => {
    get('/api/chaincode/' + channel)
        .then(resp => {
            dispatch(createAction(actionTypes.CHAINCODE_LIST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}
