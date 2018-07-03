/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const getBlockPerMin = (state) => (state.charts.blockPerMin);
export const getBlockperHour = (state) => (state.charts.blockPerHour);
export const getTxPerMin = (state) => (state.charts.transactionPerMin);
export const getTxPerHour = (state) => (state.charts.transactionPerHour);
export const getChannel = (state) => (state.charts.channel);
export const getChannels = (state) => (state.tables.channels.rows);
export const getBlockList = (state) => (state.tables.blockList.rows);
export const getChaincodeList = (state) => (state.tables.chaincodeList.rows);
export const getChannelList = (state) => (state.charts.channelList.list);
export const getDashStats = (state) => (state.charts.dashStats);
export const getNotification = (state) => (state.charts.notification);
export const getPeerList = (state) => (state.tables.peerList.rows);
export const getPeerStatus = (state) => (state.charts.peerStatus.list);
export const getTransaction = (state) => (state.tables.transaction.transaction);
export const getTransactionList = (state) => (state.tables.transactionList.rows);

export const getTxByOrg = (state) => (state.charts.transactionByOrg.rows)


