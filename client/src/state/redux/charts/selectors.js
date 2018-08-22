/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const blockPerHourSelector = state => state.charts.blockPerHour.rows;
export const blockPerMinSelector = state => state.charts.blockPerMin.rows;
export const channelListSelector = state => state.charts.channelList.list;
export const currentChannelSelector = state =>
  state.charts.channel.currentChannel;
export const dashStatsSelector = state => state.charts.dashStats;
export const notificationSelector = state => state.charts.notification;
export const peerStatusSelector = state => state.charts.peerStatus.list;
export const transactionByOrgSelector = state =>
  state.charts.transactionByOrg.rows;
export const transactionPerHourSelector = state =>
  state.charts.transactionPerHour.rows;
export const transactionPerMinSelector = state =>
  state.charts.transactionPerMin.rows;
export const errorMessageSelector = state => state.charts.errorMessage.error;
export const blockActivitySelector = state => state.charts.blockActivity.rows;
