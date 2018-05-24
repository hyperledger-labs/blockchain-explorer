/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';

export const transactionList = (channel,offset) => dispatch => {
    get('/api/txList/'+channel+'/0/0/')
        .then(resp => {
            dispatch(createAction(actionTypes.TX_LIST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}
