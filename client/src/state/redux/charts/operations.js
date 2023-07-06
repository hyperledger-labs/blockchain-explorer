/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import actions from './actions';
import { get } from '../../../services/request';

/* istanbul ignore next */
const blockPerHour = channelName => dispatch =>
	get(`/api/blocksByHour/${channelName}/1`)
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
const blockPerMin = channelName => dispatch =>
	get(`/api/blocksByMinute/${channelName}/1`)
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
const changeChannel = channelName => dispatch =>
	get(`/api/changeChannel/${channelName}`)
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
const dashStats = channelName => dispatch =>
	get(`/api/status/${channelName}`)
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
const blockActivity = channelName => dispatch =>
	get(`/api/blockActivity/${channelName}`)
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
const notification = notificationObj => dispatch => {
	const notify = JSON.parse(notificationObj);
	dispatch(actions.getNotification(notify));
};


/* istanbul ignore next */
const transactionByOrg = channelName => dispatch =>
	get(`/api/txByOrg/${channelName}`)
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
const transactionPerHour = channelName => dispatch =>
	get(`/api/txByHour/${channelName}/1`)
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
const transactionPerMin = channelName => dispatch =>
	get(`/api/txByMinute/${channelName}/1`)
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
	blockActivity
};
