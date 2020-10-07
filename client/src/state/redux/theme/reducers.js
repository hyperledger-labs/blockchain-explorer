/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

/* Reducers for Dashboard Charts */
const themeReducer = (state = { mode: 'light' }, action = {}) => {
  if (action.type === types.CHANGE_THEME) {
    return {
      ...state,
      mode: action.payload.mode,
    };
  } else {
    return state;
  }
};

export default themeReducer;
