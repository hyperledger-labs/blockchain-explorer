/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types'

const getBlockList = (blockList) => ({
  type: types.BLOCK_LIST,
  payload: {
    blockList
  }
})

const getChaincodeList = (chaincodeList) => ({
  type: types.CHAINCODE_LIST,
  payload: {
    chaincodeList
  }
})

const getChannel = (channel) => ({
  type: types.CHANNEL,
  payload: {
    channel
  }
})

const getChannelList = (channelList) => ({
  type: types.CHANNEL_LIST,
  payload: {
    channelList
  }
})

const getChannels = (channels) => ({
  type: types.CHANNELS,
  payload: {
    channels
  }
})

const getPeerList = (peerList) => ({
  type: types.PEER_LIST,
  payload: {
    peerList
  }
})

const getTransactionInfo = (transactionInfo) => ({
  type: types.TRANSACTION_INFO,
  payload: {
    transactionInfo
  }
})

const getTransactionList = (transactionList) = ({
  type: types.TRANSACTION_LIST,
  payload: {
    transactionList
  }
})

export default {
  getBlockList,
  getChaincodeList,
  getChannel,
  getChannelList,
  getChannels,
  getPeerList,
  getTransactionInfo,
  getTransactionList
}
