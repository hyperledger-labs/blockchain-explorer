/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const getBlockPerMin = (state) => (state.blockPerMin.blockPerMin);
export const getBlockperHour = (state) => (state.blockPerHour.blockPerHour);
export const getTxPerMin = (state) => (state.txPerMin.txPerMin);
export const getTxPerHour = (state) => (state.txPerHour.txPerHour);
export const getChannelSelector = (state) => (state.channel.channel);
export const getBlock = (state) => (state.block.block);
export const getBlockList = (state) => (state.blockList.blockList);
export const getChaincodes = (state) => (state.chaincodes.chaincodes);
export const getChannelList = (state) => (state.channelList.channelList);
export const getCountHeader = (state) => (state.countHeader.countHeader);
export const getNotification = (state) => (state.notification.notification);
export const getPeerList = (state) => (state.peerList.peerList);
export const getTransaction = (state) => (state.transaction.transaction);
export const getTransactionList = (state) => (state.transactionList.transactionList);

