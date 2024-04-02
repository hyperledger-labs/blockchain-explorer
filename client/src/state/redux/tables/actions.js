/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

const getBlockListSearch = blockList => ({
	type: types.BLOCK_LIST_SEARCH,
	payload: blockList
});

const getLoaded = loaded => ({
	type: types.BLOCK_RANGE_LOADED,
	payload: loaded
});

const getChaincodeList = chaincodeList => ({
	type: types.CHAINCODE_LIST,
	payload: chaincodeList
});

const getChannels = channels => ({
	type: types.CHANNELS,
	payload: channels
});

const getPeerList = peerList => ({
	type: types.PEER_LIST,
	payload: peerList
});

const getBlockRangeSearch = resp => ({
	type: types.BLOCK_RANGE_SEARCH,
	payload: resp.data
});

const getTxnList = resp => ({
	type: types.TXN_LIST,
	payload: resp.data
});

const getBlockHash = resp => ({
	type: types.BLOCK_HASH,
	payload: resp.data
});
const getBlockByTxnId = resp => ({
	type: types.BLOCK_TXN,
	payload: resp.data
});
const getBlockSearch = resp => ({
	type: types.BLOCK_SEARCH,
	payload: resp.data
});

const getChaincodeMetaData = resp => ({
	type: types.CHAINCODE_META_DATA,
	payload: resp.data
});

const getChannelPeerData = resp => ({
	type: types.CHANNEL_PEER_DATA,
	payload: resp.data
});

const getTransaction = transaction => ({
	type: types.TRANSACTION,
	payload: transaction
});

const getTransactionList = transactionList => ({
	type: types.TRANSACTION_LIST,
	payload: transactionList
});
const getTransactionListSearch = transactionList => ({
	type: types.TRANSACTION_LIST_SEARCH,
	payload: transactionList
});

export default {
	getChaincodeList,
	getChannels,
	getPeerList,
	getBlockRangeSearch,
	getTxnList,
	getBlockHash,
	getBlockByTxnId,
	getBlockSearch,
	getChaincodeMetaData,
	getChannelPeerData,
	getTransaction,
	getTransactionList,
	getBlockListSearch,
	getLoaded,
	getTransactionListSearch
};
