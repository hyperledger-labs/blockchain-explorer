/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

export const login = user => ({
	type: types.LOGIN,
	payload: user
});

export const network = networks => ({
	type: types.NETWORK,
	payload: networks
});

export const error = errors => ({
	type: types.ERROR,
	payload: errors
});

export const register = registered => ({
	type: types.REGISTER,
	payload: registered
});

export const unregister = unregistered => ({
	type: types.UNREGISTER,
	payload: unregistered
});

export const userlist = userlists => ({
	type: types.USERLIST,
	payload: userlists
});

export default {
	login,
	network,
	error,
	register,
	unregister,
	userlist
};
