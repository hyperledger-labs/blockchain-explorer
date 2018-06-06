/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Peers from '../Lists/Peers';
import Blocks from '../Lists/Blocks';
import Transactions from '../Lists/Transactions';
import DashboardView from '../View/DashboardView';
import Chaincodes from '../Lists/Chaincodes';
import { blockList } from '../../store/actions/block/action-creators';
import { chaincodes } from '../../store/actions/chaincodes/action-creators';
import { countHeader } from '../../store/actions/header/action-creators';
import { latestBlock } from '../../store/actions/latestBlock/action-creators';
import { transactionInfo } from '../../store/actions/transaction/action-creators';
import { transactionList } from '../../store/actions/transactions/action-creators';
import {
  getBlock,
  getBlockList,
  getChaincodes,
  getChannelList,
  getChannelSelector,
  getCountHeader,
  getPeerList,
  getTransaction,
  getTransactionList
} from '../../store/selectors/selectors'
import {
  Navbar,
  Nav,
  NavItem
} from 'reactstrap';

const styles = theme => ({
  card: { minWidth: 250, height: 100, },
  media: { height: 30, },
  title: {
    marginBottom: 16, fontSize: 16, color: theme.palette.text.secondary,
    position: 'absolute', right: 10, top: 10
  },
  pos: {
    marginBottom: 5,
    color: theme.palette.text.secondary,
    position: 'absolute',
    right: 10,
    top: 60,
    fontSize: 18,
  },
});

export class MenuBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeView: 'DashboardView',
      activeTab: { dashboardTab: true, networkTab: false, blocksTab: false, chaincodesTab: false },
      countHeader: { countHeader: this.props.getCountHeader() }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.countHeader) !== JSON.stringify(this.props.countHeader)) {
      this.setState({ countHeader: nextProps.countHeader });
    }
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.syncData(nextProps.channel.currentChannel)
    }
  }

  syncData = (currentChannel) => {
    this.props.getCountHeader(currentChannel);
    this.props.getLatestBlock(currentChannel);
    this.props.getBlockList(currentChannel);
    this.props.getChaincodes(currentChannel);
    this.props.getTransactionList(currentChannel, 0);
  }


  componentDidMount() {
    setInterval(() => {
      this.props.getCountHeader(this.props.channel.currentChannel);
      this.props.getLatestBlock(this.props.channel.currentChannel);
    }, 3000)
  }

  handleClickTransactionView = () => {
    this.setState({ activeView: 'TransactionView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        networkTab: false,
        blocksTab: false,
        txTab: true,
        chaincodesTab: false
      }
    });
  }

  handleClickBlockView = () => {
    this.setState({ activeView: 'BlockView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        networkTab: false,
        blocksTab: true,
        txTab: false,
        chaincodesTab: false
      }
    });
  }

  handleClickNetworkView = () => {
    this.setState({ activeView: 'PeerView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        networkTab: true,
        blocksTab: false,
        txTab: false,
        chaincodesTab: false
      }
    });
  }

  handleClickDashboardView = () => {
    this.setState({ activeView: 'DashboardView' });
    this.setState({
      activeTab: {
        dashboardTab: true,
        networkTab: false,
        blocksTab: false,
        txTab: false,
        chaincodesTab: false
      }
    });
  }

  handleClickChaincodeView = () => {
    this.setState({ activeView: 'ChaincodeView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        networkTab: false,
        blocksTab: false,
        txTab: false,
        chaincodesTab: true
      }
    });
  }

  render() {
    let currentView = null;
    switch (this.state.activeView) {
      case 'TransactionView':
        currentView = <Transactions channel={this.props.channel} countHeader={this.props.countHeader} transactionList={this.props.transactionList.rows} getTransactionList={this.props.getTransactionList} transaction={this.props.transaction} getTransactionInfo={this.props.getTransactionInfo} />;
        break;
      case 'BlockView':
        currentView = <Blocks blockList={this.props.blockList} channel={this.props.channel} countHeader={this.props.countHeader} getBlockList={this.props.getBlockList} transaction={this.props.transaction} getTransactionInfo={this.props.getTransactionInfo} />;
        break;
      case 'PeerView':
        currentView = <Peers peerList={this.props.peerList} />;
        break;
      case 'DashboardView':
        currentView = <DashboardView blockList={this.props.blockList} />;
        break;
      case 'ChaincodeView':
        currentView = <Chaincodes channel={this.props.channel} countHeader={this.props.countHeader} chaincodes={this.props.chaincodes} getChaincodes={this.props.getChaincodes} />
        break;
      default:
        currentView = <DashboardView />;
        break;
    }

    return (
      <div>
        <div className="menuItems">
          <Navbar color="faded" light expand="md">
            <Nav className="ml-auto" navbar>
              <NavItem active={this.state.activeTab.dashboardTab} onClick={this.handleClickDashboardView}>DASHBOARD </NavItem>
              <NavItem active={this.state.activeTab.networkTab} onClick={this.handleClickNetworkView}>NETWORK  </NavItem>
              <NavItem active={this.state.activeTab.blocksTab} onClick={this.handleClickBlockView}>BLOCKS </NavItem>
              <NavItem active={this.state.activeTab.txTab} onClick={this.handleClickTransactionView}>TRANSACTIONS</NavItem>
              <NavItem active={this.state.activeTab.chaincodesTab} onClick={this.handleClickChaincodeView}>CHAINCODES</NavItem>
            </Nav>
          </Navbar>
        </div>
        <div style={{ position: 'absolute', top: 140, left: 30, zIndex: 1000 }}>
          {currentView}
        </div>
      </div>
    );
  }
}

export default compose(withStyles(styles), connect((state) => ({
    block: getBlock(state),
    blockList: getBlockList(state),
    chaincodes: getChaincodes(state),
    channel: getChannelSelector(state),
    channelList: getChannelList(state),
    countHeader: getCountHeader(state),
    peerList: getPeerList(state),
    transaction: getTransaction(state),
    transactionList: getTransactionList(state)
}), {
      getBlockList: blockList,
      getChaincodes: chaincodes,
      getCountHeader: countHeader,
      getLatestBlock: latestBlock,
      getTransactionInfo: transactionInfo,
      getTransactionList: transactionList
  }))(MenuBar);
