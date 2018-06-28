/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux'
import types from './types'

const initialState = {}

const blockListReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.BLOCK_LIST: {
      return ({
        rows: action.payload.rows,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const chaincodeListReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.CHAINCODE_LIST: {
      return ({
        rows: action.payload.chaincode,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const channelListReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.CHANNEL_LIST: {
      return ({
        rows: action.payload,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const channelsReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.CHANNELS: {
      return ({
        rows: action.payload,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const peerListReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.PEER_LIST: {
      return ({
        rows: action.payload.peers,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const transactionInfoReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.TRANSACTION_INFO: {
      return ({
        transaction: action.payload.row,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}

const transactionListReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.TRANSACTION_LIST: {
      return ({
        rows: action.payload,
        loaded: true,
        errors: action.error
      })
    }
    default: {
      return state
    }
  }
}



const reducer = combineReducers({
  blockList: blockListReducer,
  chaincodeList: chaincodeListReducer,
  channel: channelReducer,
  channelList: channelListReducer,
  channels: channelsReducer,
  peerList: peerListReducer,
  transactionInfo: transactionInfoReducer,
  transactionList: transactionListReducer
})

export default reducer;
