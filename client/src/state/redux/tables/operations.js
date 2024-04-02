/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import actions from './actions';
import { get } from '../../../services/request';

/* istanbul ignore next */
const blockListSearch = (channel, query, pageParams) => dispatch =>
	get(
		`/api/blockAndTxList/${channel}/0?${
			query ? query : ''
		}&page=${pageParams?.page || 1}&size=${pageParams?.size || 10}`
	)
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
				let params = { page: pageParams?.page || 1, size: pageParams?.size || 10 };
				dispatch(
					actions.getBlockListSearch({ ...resp, query, pageParams: params })
				);
			}
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
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

/* istanbul ignore next */
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

/* istanbul ignore next */
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
const blockTxnIdList = (channel, query) => dispatch =>
	get(`/api/fetchBlockByTxId/${channel}/${query}`)
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
				dispatch(actions.getBlockByTxnId(resp));
				console.log(resp);
			}
			dispatch(actions.getBlockSearch({ data: {} }));
			dispatch(actions.getTxnList({ data: {} }));
			dispatch(actions.getBlockHash({ data: {} }));
		})
		.catch(error => {
			console.error(error);
		});

const blockHashList = (channel, query) => dispatch =>
	get(`/api/fetchBlockByHash/${channel}/${query}`)
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
				dispatch(actions.getBlockHash(resp));
				console.log(resp);
			}
			dispatch(actions.getBlockSearch({ data: {} }));
			dispatch(actions.getTxnList({ data: {} }));
			dispatch(actions.getBlockByTxnId({ data: {} }));
		})
		.catch(error => {
			console.error(error);
		});

const txnList = (channel, query) => dispatch =>
	get(`/api/fetchDataByTxnId/${channel}/${query}`)
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
				dispatch(actions.getTxnList(resp));
			}
			dispatch(actions.getBlockSearch({ data: {} }));
			dispatch(actions.getBlockHash({ data: {} }));
			dispatch(actions.getBlockByTxnId({ data: {} }));
		})
		.catch(error => {
			console.error(error);
		});

const blockSearch = (channel, query) => dispatch =>
	get(`/api/fetchDataByBlockNo/${channel}/${query}`)
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
				dispatch(actions.getBlockSearch(resp));
			}
			dispatch(actions.getTxnList({ data: {} }));
			dispatch(actions.getBlockHash({ data: {} }));
			dispatch(actions.getBlockByTxnId({ data: {} }));
		})
		.catch(error => {
			console.error(error);
		});

/* istanbul ignore next */
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

const transactionListSearch = (channel, query, pageParams) => dispatch =>
	get(
		`/api/txList/${channel}/0/0?${query ? query : ''}&page=${pageParams?.page ||
			1}&size=${pageParams?.size || 10}`
	)
		.then(resp => {
			let params = { page: pageParams?.page || 1, size: pageParams?.size || 10 };
			dispatch(
				actions.getTransactionListSearch({ ...resp, query, pageParams: params })
			);
		})
		.catch(error => {
			console.error(error);
		});
const blockRangeSearch = (channel, query1, query2) => dispatch => {
	dispatch(actions.getLoaded(false));
	get(`/api/fetchDataByBlockRange/${channel}/${query1}/${query2}`)
		.then(resp => {
			console.log('response-got', resp);
			if (resp.status === 500) {
				dispatch(
					actions.getErroMessage(
						'500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
					)
				);
			} else if (resp.status === 400) {
				dispatch(actions.getErroMessage(resp.error));
			} else {
				dispatch(actions.getBlockRangeSearch(resp));
			}
		})
		.catch(error => {
			console.error(error);
		})
		.finally(() => {
			actions.getLoaded(true);
		});
};
/* istanbul ignore next */
const transactionList = (channel, params) => dispatch =>
	get(`/api/txList/${channel}/0/0/?page=${params.page}&size=${params.size}`)
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

const chaincodeMetaData = (channel, query) => dispatch =>
	get(`/api/metadata/${channel}/${query}`)
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
				dispatch(actions.getChaincodeMetaData(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});

const channelPeerData = channel => dispatch =>
	get(`/api/fetchEndorsersCommitter/${channel}`)
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
				dispatch(actions.getChannelPeerData(resp));
			}
		})
		.catch(error => {
			console.error(error);
		});
export default {
	chaincodeList,
	channels,
	peerList,
	txnList,
	blockHashList,
	blockTxnIdList,
	blockSearch,
	chaincodeMetaData,
	channelPeerData,
	transaction,
	transactionList,
	transactionListSearch,
	blockListSearch,
	blockRangeSearch
};
