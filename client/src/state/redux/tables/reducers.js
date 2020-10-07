/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux';
import types from './types';

const initialState = {};

const blockListReducer = (state = initialState, action = {}) => {
  if (action.type === types.BLOCK_LIST) {
    return {
      rows: action.payload.rows,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const blockListSearchReducer = (state = initialState, action = {}) => {
  if (action.type === types.BLOCK_LIST_SEARCH) {
    return {
      rows: action.payload.rows,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const chaincodeListReducer = (state = initialState, action = {}) => {
  if (action.type === types.CHAINCODE_LIST) {
    return {
      rows: action.payload.chaincode,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const channelsReducer = (state = initialState, action = {}) => {
  if (action.type === types.CHANNELS) {
    return {
      rows: action.payload.channels,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }

};

const peerListReducer = (state = initialState, action = {}) => {
  if (action.type === types.PEER_LIST) {
    return {
      rows: action.payload.peers,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const transactionReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION) {
    return {
      transaction: action.payload.row,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const transactionListReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION_LIST) {
    return {
      rows: action.payload.rows,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const transactionListSearchReducer = (state = initialState, action = {}) => {
  if (action.type === types.TRANSACTION_LIST_SEARCH) {
    return {
      rows: action.payload.rows,
      loaded: true,
      errors: action.error,
    };
  } else {
    return state;
  }
};

const reducer = combineReducers({
  blockList: blockListReducer,
  chaincodeList: chaincodeListReducer,
  channels: channelsReducer,
  peerList: peerListReducer,
  transaction: transactionReducer,
  transactionList: transactionListReducer,
  blockListSearch: blockListSearchReducer,
  transactionListSearch: transactionListSearchReducer,
});

export default reducer;
