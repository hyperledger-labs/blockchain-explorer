/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux';
import types from './types';

/* Reducers for Dashboard Charts */
const initialState = {};

const blockPerHourReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.BLOCK_CHART_HOUR: {
      return {
        rows: action.payload.blockPerHour.rows,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};
const errorMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ERROR_MESSAGE: {
      return {
        error: action.payload
      };
    }
    default: {
      return state;
    }
  }
};

const blockPerMinReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.BLOCK_CHART_MIN: {
      return {
        rows: action.payload.blockPerMin.rows,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};

const channelListReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHANNEL_LIST: {
      return {
        list: action.payload.channels,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};

const channelReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHANNEL: {
      return action.payload.channel;
    }
    case types.CHANGE_CHANNEL: {
      return action.payload.channel;
    }
    default: {
      return state;
    }
  }
};

const dashStatsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.DASHBOARD_STATS: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};
const blockActivityReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.BLOCK_ACTIVITY: {
      return {
        rows: action.payload.row,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};
const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.NOTIFICATION_LOAD: {
      return action.payload.notification;
    }
    default: {
      return state;
    }
  }
};

const peerStatusReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.PEER_STATUS: {
      return {
        list: action.payload.peers,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};

const transactionByOrgReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_CHART_ORG: {
      return {
        rows: action.payload.rows,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};

const transactionPerHourReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_CHART_HOUR: {
      return {
        rows: action.payload.transactionPerHour.rows,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
  }
};

const transactionPerMinReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_CHART_MIN: {
      return {
        rows: action.payload.transactionPerMin.rows,
        loaded: true,
        errors: action.errors
      };
    }
    default: {
      return state;
    }
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
  blockActivity: blockActivityReducer
});

export default reducer;
