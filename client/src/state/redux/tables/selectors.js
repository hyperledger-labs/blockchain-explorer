/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const chaincodeListSelector = state => state.tables.chaincodeList.rows;
export const channelsSelector = state => state.tables.channels.rows;
export const peerListSelector = state => state.tables.peerList.rows;
export const txnListSelector = state => state.tables.txnList.rows;
export const blockHashSelector = state => state.tables.blockHashList.rows;
export const blockTxnIdSelector = state => state.tables.blockTxnIdList.rows;
export const blockSearchSelector = state => state.tables.blockSearch.rows;
export const chaincodeMetaDataSelector = state =>
	state.tables.chaincodeMetaData.rows;
export const channelPeerDataSelector = state =>
	state.tables.channelPeerData.rows;
export const transactionSelector = state =>
	state.tables.transaction.transaction;
export const transactionListSelector = state =>
	state.tables.transactionList.rows;
export const transactionListSearchSelector = state =>
	state.tables.transactionListSearch.rows;
export const transactionListTotalPagesSelector = state =>
	state.tables.transactionList.noOfpages;
export const transactionListSearchTotalPagesSelector = state =>
	state.tables.transactionListSearch.noOfpages;
export const transactionListSearchPageParamSelector = state =>
	state.tables.transactionListSearch.pageParams;
export const transactionListSearchQuerySelector = state =>
	state.tables.transactionListSearch.query;
export const blockListSearchSelector = state =>
	state.tables.blockListSearch.rows;
export const blockRangeSearchSelector = state =>
	state.tables.blockRangeSearch.rows;
export const blockListSearchTotalPagesSelector = state =>
	state.tables.blockListSearch.noOfpages;
export const blockListSearchPageParamSelector = state =>
	state.tables.blockListSearch.pageParams;
export const blockListSearchQuerySelector = state =>
	state.tables.blockListSearch.query;
export const blockRangeLoadedSelector = state =>
	state.tables.blockRangeSearch.loaded;
