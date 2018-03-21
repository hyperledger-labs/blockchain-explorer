import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { post } from '../../../services/request.js';

export const getTransactionInfo = (txid) => dispatch => {
    post('/api/tx/getinfo', {"txid":txid} )
        .then(resp => {
            dispatch(createAction(actionTypes.TRANSACTION_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}
