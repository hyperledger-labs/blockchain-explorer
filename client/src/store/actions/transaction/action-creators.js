/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';

export const transactionInfo = (channel,txid) => dispatch => {
    get('/api/transaction/' + channel + '/' + txid )
        .then(resp => {
            dispatch(createAction(actionTypes.TRANSACTION_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}
