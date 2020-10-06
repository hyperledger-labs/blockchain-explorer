/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { post, get } from '../../../services/request';

import {
	login as loginAction,
	network as networkAction,
	register as registerAction,
	unregister as unRegisterAction,
	userlist as userListAction,
	error as errorAction
} from './actions';

import actions from '../charts/actions';

import Auth from '../../Auth';

const login = ({ user, password }, networkObj) => dispatch =>
	post('/auth/login', { user, password, network: networkObj })
		.then(resp => {
			Auth.authenticateUser(resp.token);
			dispatch(errorAction(null));
			dispatch(loginAction({ user, ...resp }));
			return { status: 'Success' };
		})
		.catch(error => {
			// eslint-disable-next-line no-console
			console.error(error);
			dispatch(errorAction(JSON.stringify(error)));
			return { status: 'Error', message: 'Invalid User, Password' };
		});

const network = () => dispatch =>
	get('/auth/networklist', {})
		.then(({ networkList }) => {
			dispatch(networkAction({ networks: networkList }));
		})
		.catch(error => {
			// eslint-disable-next-line no-console
			console.error(error);
			dispatch(actions.getErroMessage(error));
		});

const register = user => dispatch =>
	post('/api/register', { ...user })
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				const message = resp.message;
				const msg = message.substr(6);
				return { status: 'error', message: msg };
			} else {
				dispatch(registerAction({ ...user, ...resp }));
				return { status: 'success', message: 'registered successfully!' };
			}
		})
		.catch(error => {
			console.error(error);
			dispatch(errorAction(error));
		});

const userlist = () => dispatch =>
	get('/api/userlist')
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				const message = resp.message;
				const msg = message.substr(6);
				return { status: 'error', message: msg };
			} else {
				dispatch(userListAction({ ...resp }));
				return { status: 'success', message: resp };
			}
		})
		.catch(error => {
			console.error(error);
			dispatch(errorAction(error));
		});

const unregister = user => dispatch =>
	post('/api/unregister', { ...user })
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				const message = resp.message;
				const msg = message.substr(6);
				return { status: 'error', message: msg };
			} else {
				dispatch(unRegisterAction({ ...user, ...resp }));
				return { status: 'success', message: 'Unregistered successfully!' };
			}
		})
		.catch(error => {
			console.error(error);
			dispatch(errorAction(error));
		});

const logout = () => dispatch =>
	post('/auth/logout', {})
		.then(resp => {
			console.log(resp);
			Auth.deauthenticateUser();
			dispatch(errorAction(null));
			return { status: 'Success' };
		})
		.catch(error => {
			console.error(error);
			dispatch(actions.getErroMessage(error));
			return { status: 'Error', message: 'Invalid User token' };
		});

export default {
	login,
	network,
	register,
	unregister,
	userlist,
	logout
};
