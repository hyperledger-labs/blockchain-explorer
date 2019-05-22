/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import actions from './actions';
import { get } from '../../../services/request';

const blockList = channel => dispatch =>
	get(`/api/blockAndTxList/${channel}/0`)
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
				dispatch(actions.getBlockList(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});
const blockListSearch = (channel, query) => dispatch =>
	get(`/api/blockAndTxList/${channel}/0?${query}`)
		.then(resp => {
			dispatch(actions.getBlockListSearch(resp));
		})
		.catch(error => {
			console.error(error);
		});

const chaincodeList = channel => dispatch =>
	get(`/api/chaincode/${channel}`)
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
				dispatch(actions.getChaincodeList(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

// table channel
const channels = () => dispatch =>
	get('/api/channels/info')
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
				dispatch(actions.getChannels(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

const peerList = channel => dispatch =>
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
				dispatch(actions.getPeerList(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

const transaction = (channel, transactionId) => dispatch =>
	get(`/api/transaction/${channel}/${transactionId}`)
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
				dispatch(actions.getTransaction(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

const transactionListSearch = (channel, query) => dispatch =>
	get(`/api/txList/${channel}/0/0?${query}`)
		.then(resp => {
			dispatch(actions.getTransactionListSearch(resp));
		})
		.catch(error => {
			console.error(error);
		});

const transactionList = channel => dispatch =>
	get(`/api/txList/${channel}/0/0/`)
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
				dispatch(actions.getTransactionList(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});
export default {
	blockList,
	chaincodeList,
	channels,
	peerList,
	transaction,
	transactionList,
	transactionListSearch,
	blockListSearch
};
