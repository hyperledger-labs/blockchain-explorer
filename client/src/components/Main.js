/**
 *    SPDX-License-Identifier: Apache-2.0
 */

//import React from 'react';
import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import BlocksView from './View/BlocksView';
import NetworkView from './View/NetworkView';
import TransactionsView from './View/TransactionsView';
import ChaincodeView from './View/ChaincodeView';
import DashboardView from './View/DashboardView';
import ChannelsView from './View/ChannelsView';
import { chartSelectors } from '../state/redux/charts';
import { tableOperations, tableSelectors } from '../state/redux/tables';
import {
	chaincodeListType,
	channelsType,
	currentChannelType,
	dashStatsType,
	getTransactionType,
	peerListType,
	txnListType,
	blockSearchType,
	peerStatusType,
	blockRangeSearchType,
	blockListSearchType,
	chaincodeMetaDataType,
	transactionType,
	transactionByOrgType,
	transactionListType
} from './types';
import PageNotFound from './View/PageNotFound';

import Private from './Route';

const {
	currentChannelSelector,
	blockActivitySelector,
	channelListSelector,
	dashStatsSelector,
	peerStatusSelector,
	transactionByOrgSelector
} = chartSelectors;

const {
	chaincodeListSelector,
	channelsSelector,
	peerListSelector,
	txnListSelector,
	blockSearchSelector,
	chaincodeMetaDataSelector,
	transactionSelector,
	transactionListSelector,
	blockRangeSearchSelector,
	blockRangeLoadedSelector,
	blockListSearchSelector,
	blockListSearchTotalPagesSelector,
	blockListSearchPageParamSelector,
	blockListSearchQuerySelector,
	transactionListSearchSelector,
	transactionListTotalPagesSelector,
	transactionListSearchTotalPagesSelector,
	transactionListSearchPageParamSelector,
	transactionListSearchQuerySelector
} = tableSelectors;

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		main: {
			color: dark ? '#ffffff' : undefined
		}
	};
};

export const Main = props => {
	const {
		classes,
		blockActivity,
		chaincodeList,
		channels,
		currentChannel,
		dashStats,
		getTransaction,
		peerList,
		txnList,
		blockSearch,
		peerStatus,
		chaincodeMetaData,
		getChaincodeMetaData,
		transaction,
		transactionByOrg,
		transactionList,
		blockListSearch,
		blockRangeSearch,
		blockRangeLoaded,
		blockListSearchTotalPages,
		blockListSearchQuery,
		blockListSearchPageParam,
		transactionListSearch,
		getBlockListSearch,
		getTransactionListSearch,
		getBlockRangeSearch,
		transactionListSearchTotalPages,
		transactionListTotalPages,
		transactionListSearchQuery,
		transactionListSearchPageParam,
		getTxnList
	} = props;

	const blocksViewProps = {
		blockListSearch,
		getBlockListSearch,
		getBlockRangeSearch,
		blockRangeLoaded,
		blockListSearchTotalPages,
		blockListSearchPageParam,
		blockListSearchQuery,
		blockRangeSearch,
		txnList,
		getTxnList,
		transactionByOrg,
		currentChannel,
		getTransaction,
		transaction
	};
	const chaincodeViewProps = {
		chaincodeList,
		chaincodeMetaData,
		getChaincodeMetaData
	};

	const channelsViewProps = {
		channels
	};

	const dashboardViewProps = {
		blockListSearch,
		dashStats,
		peerStatus,
		txnList,
		blockSearch,
		transactionByOrg,
		blockActivity
	};

	const networkViewProps = {
		peerList
	};

	const transactionsViewProps = {
		currentChannel,
		transaction,
		transactionList,
		getTransaction,
		transactionByOrg,
		transactionListSearch,
		getTransactionListSearch,
		transactionListSearchTotalPages,
		transactionListTotalPages,
		transactionListSearchPageParam,
		transactionListSearchQuery
	};

	const [transactionId, setTransactionId] = useState('');

	useEffect(() => {
		let windowUrl = window.location.search;
		let queryParams = new URLSearchParams(windowUrl);
		if (queryParams.get('tab')) {
			setTransactionId(queryParams.get('transId'));
			const { history } = props;
			let routePath = '/' + queryParams.get('tab');
			history.replace(routePath);
		}
	}, []);

	function removeTransactionId() {
		let windowUrl = window.location.search;
		let queryParams = new URLSearchParams(windowUrl);
		if (queryParams.get('tab')) {
			queryParams.delete('tab');
			queryParams.delete('transId');
		}
		setTransactionId('');
	}

	return (
		<Router>
			<div className={classes.main}>
				<Switch>
					<Private
						exact
						path="/"
						render={routeprops => (
							<DashboardView {...{ ...dashboardViewProps, ...routeprops }} />
						)}
					/>
					<Private
						exact
						path="/blocks"
						render={routeprops => (
							<BlocksView {...{ ...blocksViewProps, ...routeprops }} />
						)}
					/>
					<Private
						exact
						path="/chaincodes"
						render={routeprops => (
							<ChaincodeView {...{ ...chaincodeViewProps, ...routeprops }} />
						)}
					/>
					<Private
						exact
						path="/channels"
						render={routeprops => (
							<ChannelsView {...{ ...channelsViewProps, ...routeprops }} />
						)}
					/>
					<Private
						exact
						path="/network"
						render={routeprops => (
							<NetworkView {...{ ...networkViewProps, ...routeprops }} />
						)}
					/>
					<Private
						exact
						path="/transactions"
						render={routeprops => (
							<TransactionsView
								{...{ ...transactionsViewProps, ...routeprops }}
								transactionId={transactionId}
								removeTransactionId={removeTransactionId}
							/>
						)}
					/>
					<Route exact render={routeprops => <PageNotFound {...routeprops} />} />
				</Switch>
			</div>
		</Router>
	);
};

Main.propTypes = {
	blockListSearch: blockListSearchType.isRequired,
	blockRangeSearch: blockRangeSearchType.isRequired,
	chaincodeList: chaincodeListType.isRequired,
	channels: channelsType.isRequired,
	currentChannel: currentChannelType.isRequired,
	dashStats: dashStatsType.isRequired,
	getTransaction: getTransactionType.isRequired,
	peerList: peerListType.isRequired,
	txnList: txnListType.isRequired,
	blockSearch: blockSearchType.isRequired,
	peerStatus: peerStatusType.isRequired,
	chaincodeMetaData: chaincodeMetaDataType.isRequired,
	transaction: transactionType.isRequired,
	transactionByOrg: transactionByOrgType.isRequired,
	transactionList: transactionListType.isRequired
};

const connectedComponent = connect(
	state => ({
		chaincodeList: chaincodeListSelector(state),
		channelList: channelListSelector(state),
		channels: channelsSelector(state),
		currentChannel: currentChannelSelector(state),
		dashStats: dashStatsSelector(state),
		peerList: peerListSelector(state),
		txnList: txnListSelector(state),
		blockSearch: blockSearchSelector(state),
		peerStatus: peerStatusSelector(state),
		chaincodeMetaData: chaincodeMetaDataSelector(state),
		transaction: transactionSelector(state),
		transactionByOrg: transactionByOrgSelector(state),
		transactionList: transactionListSelector(state),
		blockListSearch: blockListSearchSelector(state),
		blockListSearchTotalPages: blockListSearchTotalPagesSelector(state),
		blockListSearchPageParam: blockListSearchPageParamSelector(state),
		blockListSearchQuery: blockListSearchQuerySelector(state),
		blockRangeSearch: blockRangeSearchSelector(state),
		blockRangeLoaded: blockRangeLoadedSelector(state),
		transactionListSearch: transactionListSearchSelector(state),
		transactionListTotalPages: transactionListTotalPagesSelector(state),
		transactionListSearchTotalPages: transactionListSearchTotalPagesSelector(state),
		transactionListSearchPageParam: transactionListSearchPageParamSelector(state),
		transactionListSearchQuery: transactionListSearchQuerySelector(state),
		blockActivity: blockActivitySelector(state)
	}),
	{
		getTransaction: tableOperations.transaction,
		getBlockListSearch: tableOperations.blockListSearch,
		getBlockRangeSearch: tableOperations.blockRangeSearch,
		getTransactionListSearch: tableOperations.transactionListSearch,
		getTxnList: tableOperations.txnList,
		getChaincodeMetaData: tableOperations.chaincodeMetaData,
	}
)(Main);
export default withStyles(styles)(connectedComponent);
