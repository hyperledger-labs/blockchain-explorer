/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const blockListSelector = state => state.tables.blockList.rows;
export const chaincodeListSelector = state => state.tables.chaincodeList.rows;
export const channelsSelector = state => state.tables.channels.rows;
export const peerListSelector = state => state.tables.peerList.rows;
export const transactionSelector = state => state.tables.transaction.transaction;
export const transactionListSelector = state => state.tables.transactionList.rows;
export const transactionListSearchSelector = state => state.tables.transactionListSearch.rows;
export const blockListSearchSelector = state => state.tables.blockListSearch.rows;
