/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

const getBlockList = blockList => ({
  type: types.BLOCK_LIST,
  payload: blockList,
});
const getBlockListSearch = blockList => ({
  type: types.BLOCK_LIST_SEARCH,
  payload: blockList,
});

const getChaincodeList = chaincodeList => ({
  type: types.CHAINCODE_LIST,
  payload: chaincodeList,
});

const getChannels = channels => ({
  type: types.CHANNELS,
  payload: channels,
});

const getPeerList = peerList => ({
  type: types.PEER_LIST,
  payload: peerList,
});

const getTransaction = transaction => ({
  type: types.TRANSACTION,
  payload: transaction,
});

const getTransactionList = transactionList => ({
  type: types.TRANSACTION_LIST,
  payload: transactionList,
});
const getTransactionListSearch = transactionList => ({
  type: types.TRANSACTION_LIST_SEARCH,
  payload: transactionList,
});

export default {
  getBlockList,
  getChaincodeList,
  getChannels,
  getPeerList,
  getTransaction,
  getTransactionList,
  getBlockListSearch,
  getTransactionListSearch,
};
