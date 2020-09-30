/**
 *    SPDX-License-Identifier: Apache-2.0
 */

export const authSelector = state => state.auth.token;

export const errorSelector = state => state.auth.error;

export const networkSelector = state => state.auth.networks;

export const registeredSelector = state => state.auth.registered;

export const userlistSelector = state => state.auth.userlists;

export const unregisteredSelector = state => state.auth.unregistered;
