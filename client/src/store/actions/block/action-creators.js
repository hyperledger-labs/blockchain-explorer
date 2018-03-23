import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';

export const getBlockList = (channel, offset) => dispatch => {
    get('/api/blockAndTxList/' + channel + '/0/10/' + offset)
        .then(resp => {
            dispatch(createAction(actionTypes.BLOCK_LIST_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}
