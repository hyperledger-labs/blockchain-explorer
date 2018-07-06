/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import * as types from "./types";

 const getBlockPerHour = (blockPerHour) => ({
    type: types.BLOCK_CHART_HOUR,
    payload: {blockPerHour}
});

 const getBlockPerMin = (blockPerMin) => ({
    type: types.BLOCK_CHART_MIN,
    payload: {blockPerMin}
});

 const getTransactionPerHour = (transactionPerHour) => ({
    type: types.TRANSACTION_CHART_HOUR,
    payload: {transactionPerHour}
});

 const getTransactionPerMin = (transactionPerMin) => ({
    type: types.TRANSACTION_CHART_MIN,
    payload: {transactionPerMin}
});

const getTransactionByOrg = (transactionByOrg) => ({
    type: types.TRANSACTION_CHART_ORG,
    payload: transactionByOrg
});

const getNotification = (notification) => ({
    type: types.NOTIFICATION_LOAD,
    payload:{notification}
});

const getDashStats = (dashStats) => ({
    type: types.DASHBOARD_STATS,
    payload: dashStats
});

const getChannel = (channel) => ({
    type: types.CHANNEL,
    payload:{channel}
});

const getChannelList = (channelList) => ({
    type: types.CHANNEL_LIST,
    payload: channelList
});

const updateChannel = (channel) => ({
    type: types.CHANGE_CHANNEL,
    payload:{channel}
});

const getPeerStatus = (peerStatus) => ({
    type: types.PEER_STATUS,
    payload: peerStatus
})

export default {
    getBlockPerHour,
    getBlockPerMin,
    getTransactionPerHour,
    getTransactionPerMin,
    getTransactionByOrg,
    getNotification,
    getDashStats,
    getChannel,
    getChannelList,
    updateChannel,
    getPeerStatus
};
