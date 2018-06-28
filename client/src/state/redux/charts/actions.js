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
    payload:{transactionByOrg}
});

const getNotification = (notification) => ({
    type: types.NOTIFICATION_LOAD,
    payload:{notification}
});

const getDashStats = (stats) => ({
    type: types.DASHBOARD_STATS,
    payload:{stats}
});

const getChannel = (channel) => ({
    type: types.CHANNEL,
    payload:{channel}
});

const updateChannel = (channel) => ({
    type: types.CHANGE_CHANNEL,
    payload:{channel}
});

export default {
    getBlockPerHour,
    getBlockPerMin,
    getTransactionPerHour,
    getTransactionPerMin,
    getTransactionByOrg,
    getNotification,
    getDashStats,
    getChannel,
    updateChannel
};