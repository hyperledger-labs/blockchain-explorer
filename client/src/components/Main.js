/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import compose from 'recompose/compose';
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
	blockListType,
	chaincodeListType,
	channelsType,
	currentChannelType,
	dashStatsType,
	getTransactionType,
	peerListType,
	peerStatusType,
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
	blockListSelector,
	chaincodeListSelector,
	channelsSelector,
	peerListSelector,
	transactionSelector,
	transactionListSelector,
	blockListSearchSelector,
	transactionListSearchSelector
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
		blockList,
		blockActivity,
		chaincodeList,
		channels,
		currentChannel,
		dashStats,
		getTransaction,
		peerList,
		peerStatus,
		transaction,
		transactionByOrg,
		transactionList,
		blockListSearch,
		transactionListSearch,
		getBlockListSearch,
		getTransactionListSearch
	} = props;

	const blocksViewProps = {
		blockList,
		blockListSearch,
		getBlockListSearch,
		transactionByOrg,
		currentChannel,
		getTransaction,
		transaction
	};
	const chaincodeViewProps = {
		chaincodeList
	};

	const channelsViewProps = {
		channels
	};

	const dashboardViewProps = {
		blockList,
		dashStats,
		peerStatus,
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
		getTransactionListSearch
	};

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
							<TransactionsView {...{ ...transactionsViewProps, ...routeprops }} />
						)}
					/>
					<Route exact render={routeprops => <PageNotFound {...routeprops} />} />
				</Switch>
			</div>
		</Router>
	);
};

Main.propTypes = {
	blockList: blockListType.isRequired,
	chaincodeList: chaincodeListType.isRequired,
	channels: channelsType.isRequired,
	currentChannel: currentChannelType.isRequired,
	dashStats: dashStatsType.isRequired,
	getTransaction: getTransactionType.isRequired,
	peerList: peerListType.isRequired,
	peerStatus: peerStatusType.isRequired,
	transaction: transactionType.isRequired,
	transactionByOrg: transactionByOrgType.isRequired,
	transactionList: transactionListType.isRequired
};

export default compose(
	withStyles(styles),
	connect(
		state => ({
			blockList: blockListSelector(state),
			chaincodeList: chaincodeListSelector(state),
			channelList: channelListSelector(state),
			channels: channelsSelector(state),
			currentChannel: currentChannelSelector(state),
			dashStats: dashStatsSelector(state),
			peerList: peerListSelector(state),
			peerStatus: peerStatusSelector(state),
			transaction: transactionSelector(state),
			transactionByOrg: transactionByOrgSelector(state),
			transactionList: transactionListSelector(state),
			blockListSearch: blockListSearchSelector(state),
			transactionListSearch: transactionListSearchSelector(state),
			blockActivity: blockActivitySelector(state)
		}),
		{
			getTransaction: tableOperations.transaction,
			getBlockListSearch: tableOperations.blockListSearch,
			getTransactionListSearch: tableOperations.transactionListSearch
		}
	)
)(Main);
