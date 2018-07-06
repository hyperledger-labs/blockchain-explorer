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
import { chartSelectors } from '../state/redux/charts/'
import { tableOperations, tableSelectors } from '../state/redux/tables/'

const {
  currentChannelSelector,
  channelListSelector,
  dashStatsSelector,
  peerStatusSelector,
  transactionByOrgSelector,
} = chartSelectors

const {
  blockListSelector,
  chaincodeListSelector,
  channelsSelector,
  peerListSelector,
  transactionSelector,
  transactionListSelector,
} = tableSelectors

const {
  transaction,
} = tableOperations


export const Main = (props) => {
  const blocksViewProps = {
    blockList: props.blockList,
    currentChannel: props.currentChannel,
    getTransaction: props.getTransaction,
    transaction: props.transaction,
  }

  const chaincodeViewProps = {
    chaincodeList: props.chaincodeList
  }

  const channelsViewProps = {
    channels: props.channels,
  }

  const dashboardViewProps = {
    blockList: props.blockList,
    dashStats: props.dashStats,
    peerStatus : props.peerStatus,
    transactionByOrg: props.transactionByOrg,
  }

  const networkViewProps = {
    peerList: props.peerList
  }

  const transactionsViewProps = {
    currentChannel: props.currentChannel,
    transaction: props.transaction,
    transactionList: props.transactionList,
    getTransaction: props.getTransaction
  }

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" render={() => <DashboardView {...dashboardViewProps} />} />
          <Route path="/blocks" render={() => <BlocksView {...blocksViewProps} />} />
          <Route path="/chaincodes" render={() => <ChaincodeView {...chaincodeViewProps} />} />
          <Route path="/channels" render={() => <ChannelsView {...channelsViewProps} />} />
          <Route path="/network" render={() => <NetworkView  {...networkViewProps} />} />
          <Route path="/transactions" render={() => <TransactionsView {...transactionsViewProps} />} />
        </Switch>
      </div>
    </Router>
  );
};

export default connect((state) => ({
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
}), {
    getTransaction: transaction,
  })(Main);
