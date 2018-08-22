/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux';
import types from './types';

const initialState = {};

const blockListReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.BLOCK_LIST: {
      return {
        rows: action.payload.rows,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const blockListSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.BLOCK_LIST_SEARCH: {
      return {
        rows: action.payload.rows,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const chaincodeListReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHAINCODE_LIST: {
      return {
        rows: action.payload.chaincode,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const channelsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHANNELS: {
      return {
        rows: action.payload.channels,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const peerListReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.PEER_LIST: {
      return {
        rows: action.payload.peers,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION: {
      return {
        transaction: action.payload.row,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const transactionListReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_LIST: {
      return {
        rows: action.payload.rows,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
  }
};

const transactionListSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_LIST_SEARCH: {
      return {
        rows: action.payload.rows,
        loaded: true,
        errors: action.error
      };
    }
    default: {
      return state;
    }
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
  transactionListSearch: transactionListSearchReducer
});

export default reducer;
