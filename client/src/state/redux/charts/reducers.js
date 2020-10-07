/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux';
import types from './types';

/* Reducers for Dashboard Charts */
const initialState = {};

const blockPerHourReducer = (state = initialState, action = {}) => {
  if (action.type === types.BLOCK_CHART_HOUR) {
    return {
      rows: action.payload.blockPerHour.rows,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};
const errorMessageReducer = (state = initialState, action = {}) => {
  if (action.type === types.ERROR_MESSAGE) {
    return {
      error: action.payload,
    };
  } else {
    return state;
  }
};

const blockPerMinReducer = (state = initialState, action = {}) => {
  if (action.type === types.BLOCK_CHART_MIN) {
    return {
      rows: action.payload.blockPerMin.rows,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const channelListReducer = (state = initialState, action = {}) => {
  if (action.type === types.CHANNEL_LIST) {
    return {
      list: action.payload.channels,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const channelReducer = (state = initialState, action = {}) => {
  if (action.type === types.CHANNEL || action.type === types.CHANGE_CHANNEL) {
    return action.payload.channel;
  } else {
    return state;
  }
};

const dashStatsReducer = (state = initialState, action = {}) => {
  if (action.type === types.DASHBOARD_STATS) {
    return action.payload;
  } else {
    return state;
  }
};
const blockActivityReducer = (state = initialState, action = {}) => {
  if (action.type === types.BLOCK_ACTIVITY) {
    return {
      rows: action.payload.row,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};
const notificationReducer = (state = initialState, action = {}) => {
  if (action.type === types.NOTIFICATION_LOAD) {
    return action.payload.notification;
  } else {
    return state;
  }
};

const peerStatusReducer = (state = initialState, action = {}) => {
  if (action.type === types.PEER_STATUS) {
    return {
      list: action.payload.peers,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const transactionByOrgReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION_CHART_ORG) {
    return {
      rows: action.payload.rows,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const transactionPerHourReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION_CHART_HOUR) {
    return {
      rows: action.payload.transactionPerHour.rows,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const transactionPerMinReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION_CHART_MIN) {
    return {
      rows: action.payload.transactionPerMin.rows,
      loaded: true,
      errors: action.errors,
    };
  } else {
    return state;
  }
};

const reducer = combineReducers({
  blockPerHour: blockPerHourReducer,
  blockPerMin: blockPerMinReducer,
  channel: channelReducer,
  channelList: channelListReducer,
  dashStats: dashStatsReducer,
  notification: notificationReducer,
  peerStatus: peerStatusReducer,
  transactionByOrg: transactionByOrgReducer,
  transactionPerHour: transactionPerHourReducer,
  transactionPerMin: transactionPerMinReducer,
  errorMessage: errorMessageReducer,
  blockActivity: blockActivityReducer,
});

export default reducer;
