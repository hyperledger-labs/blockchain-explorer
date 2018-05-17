/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const getBlockPerMin = (state) => (state.blockPerMin.blockPerMin);
export const getBlockperHour = (state) => (state.blockPerHour.blockPerHour);
export const getTxPerMin = (state) => (state.txPerMin.txPerMin);
export const getTxPerHour = (state) => (state.txPerHour.txPerHour);
export const getChannelSelector = (state) => (state.channel.channel);
