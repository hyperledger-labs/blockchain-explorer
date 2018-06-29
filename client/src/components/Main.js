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
import {
  getBlock,
  getBlockList,
  getChaincodes,
  getChannelList,
  getChannel,
  getChannels,
  getCountHeader,
  getNotification,
  getPeerList,
  getTransaction,
  getTransactionList,
  getTxByOrg,
  getPeerStatus
} from "../store/selectors/selectors";
import { blockList } from "../store/actions/block/action-creators";
import { chaincodes } from "../store/actions/chaincodes/action-creators";
import { countHeader } from "../store/actions/header/action-creators";
import { channelsData } from "../store/actions/channels/action-creators";
import { latestBlock } from "../store/actions/latestBlock/action-creators";
import { transactionInfo } from "../store/actions/transaction/action-creators";
import { transactionList } from "../store/actions/transactions/action-creators";
import { txByOrg } from "../store/actions/charts/action-creators";
import { removeTransactionInfo } from "../store/actions/removeTransactionInfo/action-creators";

export const Main = (props) => {
  const blocksViewProps = {
    blockList: props.blockList,
    channel: props.channel,
    transaction: props.transaction,
    getTransactionInfo: props.getTransactionInfo,
    removeTransactionInfo: props.removeTransactionInfo
  };

  const chaincodeViewProps = {
    channel: props.channel,
    chaincodes: props.chaincodes
  }

  const channelsViewProps = {
    channels: props.channels,
    getChannels: props.getChannels
  }

  const dashboardViewProps = {
    countHeader: props.countHeader,
    channel: props.channel,
    txByOrg: props.txByOrg,
    blockList: props.blockList,
    peerStatus : props.peerStatus
  }

  const networkViewProps = {
    peerList: props.peerList
  }

  const transactionsViewProps = {
    channel: props.channel,
    transaction: props.transaction,
    transactionList: props.transactionList,
    getTransactionInfo: props.getTransactionInfo,
    removeTransactionInfo: props.removeTransactionInfo,
    getTransactionList: props.getTransactionList
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

export default connect(
  state => ({
    block: getBlock(state),
    blockList: getBlockList(state),
    chaincodes: getChaincodes(state),
    channel: getChannel(state),
    channelList: getChannelList(state),
    countHeader: getCountHeader(state),
    notification: getNotification(state),
    peerList: getPeerList(state),
    peerStatus: getPeerStatus(state),
    transaction: getTransaction(state),
    transactionList: getTransactionList(state),
    channels: getChannels(state),
    txByOrg: getTxByOrg(state),
    removeTransactionInfo: removeTransactionInfo(state)
  }),
  {
    getBlockList: blockList,
    getChaincodes: chaincodes,
    getCountHeader: countHeader,
    getLatestBlock: latestBlock,
    getTransactionInfo: transactionInfo,
    getTransactionList: transactionList,
    getChannels: channelsData,
    removeTransactionInfo: removeTransactionInfo,
    getTxByOrg: txByOrg
  }
)(Main);
