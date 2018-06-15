/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { get } from '../../../services/request.js';

export const peerStatus = (channel) => dispatch => {
    get('/api/peersStatus/'+channel)
        .then(resp => {			
            dispatch(createAction(actionTypes.PEER_STATUS_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

export const peerList = (channel) => dispatch => {
  get('/api/peers/' + channel)
    .then(resp => {
      dispatch(createAction(actionTypes.PEER_LIST_POST)(resp))
    }).catch((error) => {
      console.error(error);
    })
}
