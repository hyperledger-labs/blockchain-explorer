/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import actions from './actions';
import { get } from '../../../services/request';

/* istanbul ignore next */
const blockPerHour = channel => dispatch =>
	get(`/api/blocksByHour/${channel}/1`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getBlockPerHour(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const blockPerMin = channel => dispatch =>
	get(`/api/blocksByMinute/${channel}/1`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getBlockPerMin(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const changeChannel = channel => dispatch =>
	get(`/api/changeChannel/${channel}`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.updateChannel(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const channel = () => dispatch =>
	get('/api/curChannel')
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getChannel(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const channelList = () => dispatch =>
	get('/api/channels')
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getChannelList(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const dashStats = channel => dispatch =>
	get(`/api/status/${channel}`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getDashStats(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const blockActivity = channel => dispatch =>
	get(`/api/blockActivity/${channel}`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getBlockActivity(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const notification = notification => dispatch => {
	const notify = JSON.parse(notification);
	dispatch(actions.getNotification(notify));
};

/* istanbul ignore next */
const peerStatus = channel => dispatch =>
	get(`/api/peersStatus/${channel}`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getPeerStatus(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const transactionByOrg = channel => dispatch =>
	get(`/api/txByOrg/${channel}`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getTransactionByOrg(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const transactionPerHour = channel => dispatch =>
	get(`/api/txByHour/${channel}/1`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getTransactionPerHour(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
const transactionPerMin = channel => dispatch =>
	get(`/api/txByMinute/${channel}/1`)
		.then(resp => {
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getTransactionPerMin(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

export default {
	blockPerHour,
	blockPerMin,
	transactionPerHour,
	transactionPerMin,
	transactionByOrg,
	notification,
	dashStats,
	channel,
	channelList,
	changeChannel,
	peerStatus,
	blockActivity
};
