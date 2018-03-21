import { createAction } from 'redux-actions';
import * as actionTypes from '../action-types';
import { get } from '../../../services/request.js';

export const getHeaderCount = (channel) => dispatch => {
    // get('/api/status/get')
    get('/api/status/' + channel)
        .then(resp => {
            dispatch(createAction(actionTypes.COUNT_HEADER_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}