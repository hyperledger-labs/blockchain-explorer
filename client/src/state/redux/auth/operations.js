/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { post, get } from '../../../services/request';

import {
	login as loginAction,
	network as networkAction,
	register as registerAction,
	error as errorAction
} from './actions';

import actions from '../charts/actions';

import Auth from '../../Auth';

const login = ({ user, password }, network) => dispatch =>
	post('/auth/login', { user, password, network })
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
			const networks = networkList.map(network => network[0]);
			dispatch(networkAction({ networks }));
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
				let message = resp.message;
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

export default {
	login,
	network,
	register
};
