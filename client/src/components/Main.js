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
} from '../store/selectors/selectors';
import { blockList } from '../store/actions/block/action-creators';
import { chaincodes } from '../store/actions/chaincodes/action-creators';
import { countHeader } from '../store/actions/header/action-creators';
import { channelsData } from '../store/actions/channels/action-creators';
import { latestBlock } from '../store/actions/latestBlock/action-creators';
import { transactionInfo } from '../store/actions/transaction/action-creators';
import { transactionList } from '../store/actions/transactions/action-creators';
import { txByOrg } from '../store/actions/charts/action-creators';

export const Main = (props) => {
  const blocksViewProps = {
    blockList: props.blockList,
    channel: props.channel,
    countHeader: props.countHeader,
    transaction: props.transaction,
    transactionList: props.transactionList,
    getBlockList: props.getBlockList,
    getCountHeader: props.getCountHeader,
    getLatestBlock: props.getLatestBlock,
    getTransactionInfo: props.getTransactionInfo,
    getTransactionList: props.getTransactionList
  }

  const chaincodeViewProps = {
    channel: props.channel,
    countHeader: props.countHeader,
    chaincodes: props.chaincodes,
    getChaincodes: props.getChaincodes,
    getCountHeader: props.getCountHeader
  }

  const channelsViewProps = {
    channels: props.channels,
    getChannels: props.getChannels
  }

  const dashboardViewProps = {
    blockList: props.blockList,
    channel: props.channel,
    countHeader: props.countHeader,
    notification: props.notification,
    peerList: props.peerList,
    peerStatus : props.peerStatus,
    txByOrg: props.txByOrg,
    getTxByOrg: props.getTxByOrg,
    getCountHeader: props.getCountHeader
  }

  const networkViewProps = {
    peerList: props.peerList
  }

  const transactionsViewProps = {
    channel: props.channel,
    countHeader: props.countHeader,
    transaction: props.transaction,
    transactionList: props.transactionList,
    getCountHeader: props.getCountHeader,
    getLatestBlock: props.getLatestBlock,
    getTransactionInfo: props.getTransactionInfo,
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
  )
}

export default connect((state) => ({
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
  txByOrg: getTxByOrg(state)
}), {
    getBlockList: blockList,
    getChaincodes: chaincodes,
    getCountHeader: countHeader,
    getLatestBlock: latestBlock,
    getTransactionInfo: transactionInfo,
    getTransactionList: transactionList,
    getChannels: channelsData,
    getTxByOrg: txByOrg
  })(Main);
