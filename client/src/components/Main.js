/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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

const {
  currentChannelSelector,
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
  transactionListSelector
} = tableSelectors;

export const Main = props => {
  const {
    blockList,
    chaincodeList,
    channels,
    currentChannel,
    dashStats,
    getTransaction,
    peerList,
    peerStatus,
    transaction,
    transactionByOrg,
    transactionList
  } = props;

  const blocksViewProps = {
    blockList,
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
    transactionByOrg
  };

  const networkViewProps = {
    peerList
  };

  const transactionsViewProps = {
    currentChannel,
    transaction,
    transactionList,
    getTransaction
  };

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => <DashboardView {...dashboardViewProps} />}
          />
          <Route
            exact
            path="/blocks"
            render={() => <BlocksView {...blocksViewProps} />}
          />
          <Route
            exact
            path="/chaincodes"
            render={() => <ChaincodeView {...chaincodeViewProps} />}
          />
          <Route
            exact
            path="/channels"
            render={() => <ChannelsView {...channelsViewProps} />}
          />
          <Route
            exact
            path="/network"
            render={() => <NetworkView {...networkViewProps} />}
          />
          <Route
            exact
            path="/transactions"
            render={() => <TransactionsView {...transactionsViewProps} />}
          />
          <Route exact render={() => <PageNotFound />} />
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

export default connect(
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
    transactionList: transactionListSelector(state)
  }),
  {
    getTransaction: tableOperations.transaction
  }
)(Main);
