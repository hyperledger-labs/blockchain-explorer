import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';
export const getChannel = () => dispatch => {
    // post('curChannel')
    get('/api/curChannel')
        .then(resp => {
            dispatch(createAction(actionTypes.CHANNEL)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

