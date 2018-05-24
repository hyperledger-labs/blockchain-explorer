/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'

export const getNotification = (notification) => dispatch => {
    var notify = JSON.parse(notification);
    dispatch(createAction(actionTypes.NOTIFICATION_LOAD)(notify))

}
