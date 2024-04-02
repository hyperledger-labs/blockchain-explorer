/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { arrayOf, shape, number, string, func, any } from 'prop-types';

export const blockbyTxIdType = shape({
	blockhash: string,
	blocknum: number,
	channelname: string,
	creatdt: string,
	datahash: string,
	prehash: string,
	txcount: number,
	txhash: arrayOf(string)
});

export const blockbyBlockHashType = shape({
	blockhash: string,
	blocknum: number,
	channelname: string,
	creatdt: string,
	datahash: string,
	prehash: string,
	txcount: number,
	txhash: arrayOf(string)
});
export const blockHashType = shape({
	blockhash: string,
	blocknum: number,
	channelname: string,
	creatdt: string,
	datahash: string,
	prehash: string,
	txcount: number,
	txhash: arrayOf(string)
});

export const blockListType = arrayOf(
	shape({
		blockhash: string,
		blocknum: number,
		channelname: string,
		createdt: string,
		datahash: string,
		prehash: string,
		txcount: number,
		txhash: arrayOf(string)
	})
);

export const blockListSearchType = arrayOf(
	shape({
		blockhash: string,
		blocknum: number,
		channelname: string,
		createdt: string,
		datahash: string,
		prehash: string,
		txcount: number,
		txhash: arrayOf(string)
	})
);

export const blockPerHourType = arrayOf(
	shape({
		count: string,
		datetime: string
	})
);

export const blockPerMinType = arrayOf(
	shape({
		count: string,
		datetime: string
	})
);

export const chaincodeType = shape({
	chaincodename: string,
	channelName: string,
	channel_genesis_hash: string,
	path: string,
	source: string,
	txCount: number,
	version: string
});

export const chaincodeListType = arrayOf(
	shape({
		chaincodename: string,
		channelName: string,
		channel_genesis_hash: string,
		path: string,
		source: string,
		txCount: number,
		version: string
	})
);

export const channelsType = arrayOf(
	shape({
		blocks: number,
		channel_hash: string,
		channelname: string,
		createdat: string,
		channel_genesis_hash: string,
		id: number,
		transactions: number
	})
);

export const chartDataType = shape({
	dataMax: number.isRequired,
	displayData: arrayOf(
		shape({
			count: string,
			datetime: string
		})
	).isRequired
});

export const currentChannelType = string;

export const dashStatsType = shape({
	chaincodeCount: string,
	latestBlock: string,
	peerCount: string,
	txCount: string
});

export const getBlockListType = func;
export const getBlocksPerHourType = func;
export const getBlocksPerMinType = func;
export const getChaincodeListType = func;
export const getChangeChannelType = func;
export const getChannelType = func;
export const getChannelListType = func;
export const getChannelsType = func;
export const getDashStatsType = func;
export const getPeerListType = func;
export const getTxnListType = func;
export const getBlockSearchType = func;
export const getPeerStatusType = func;
export const getChaincodeMetaDataType = func;
export const getTransactionInfoType = func;
export const getTransactionListType = func;
export const getTransactionType = func;
export const getTransactionByOrgType = func;
export const getTransactionPerHourType = func;
export const getTransactionPerMinType = func;
export const getUserListType = func;
export const getBlockRangeSearchType = func;
export const getBlockListSearchType = func;

export const blockRangeSearchType = any;

export const notificationsType = arrayOf(
	shape({
		blockhash: string,
		datahash: string,
		time: string,
		title: string,
		txcount: number,
		type: string
	})
);

export const onCloseType = func;

export const peerListType = arrayOf(
	shape({
		channel_genesis_hash: string,
		name: string,
		requests: string.isRequired,
		server_hostname: string.isRequired
	})
);

export const txnListType = any;
export const blockHashTypee = any;
export const blockTxnIdType = any;

export const blockSearchType = any;

export const peerStatusType = arrayOf(
	shape({
		server_hostname: string,
		status: string
	})
);
export const chaincodeMetaDataType = any;

export const refreshType = func;

export const channelPeerDataType = shape({
	committers: arrayOf(string),
	endorsers: arrayOf(string)
});

export const transactionType = shape({
	chaincodename: string,
	channelname: string,
	createdt: string,
	creator_msp_id: string,
	endorser_msp_id: string,
	payload_proposal_hash: string,
	txhash: string,
	type: string,
	validation_code: string
});

export const transactionByOrgType = arrayOf(
	shape({
		count: string,
		creator_msp_id: string
	})
);

export const transactionListType = arrayOf(
	shape({
		chaincodename: string,
		channelname: string,
		createdt: string,
		creator_msp_id: string,
		txhash: string,
		type: string
	})
);

export const transactionPerHourType = arrayOf(
	shape({
		count: string,
		datetime: string
	})
);

export const transactionPerMinType = arrayOf(
	shape({
		count: string,
		datetime: string
	})
);

export const userListType = arrayOf(
	shape({
		username: string,
		email: string,
		networkName: string,
		firstName: string,
		lastName: string,
		roles: string
	})
);
