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
import Channels from '../Lists/Channels';
import Chaincodes from '../Lists/Chaincodes';
import { getChaincodes as getChaincodesCreator } from '../../store/actions/chaincodes/action-creators';
import { getBlockList as getBlockListCreator } from '../../store/actions/block/action-creators';
import { getTransactionInfo as getTransactionInfoCreator } from '../../store/actions/transaction/action-creators';
import { getLatestBlock as getLatestBlockCreator } from '../../store/actions/latestBlock/action-creators';
import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import { getTransactionList as getTransactionListCreator } from '../../store/actions/transactions/action-creators';


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

class MenuBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeView: 'DashboardView',
      activeTab: { dashboardTab: true, peersTab: false, blocksTab: false, chaincodesTab: false },
      countHeader: { countHeader: this.props.getCountHeader() }
    }

    this.handleClickTransactionView = this.handleClickTransactionView.bind(this);
    this.handleClickBlockView = this.handleClickBlockView.bind(this);
    this.handleClickChannelView = this.handleClickChannelView.bind(this);
    this.handleClickPeerView = this.handleClickPeerView.bind(this);
    this.handleClickDashboardView = this.handleClickDashboardView.bind(this);
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.countHeader) !== JSON.stringify(this.props.countHeader)) {
      // console.log('nextProps.countHeader !== this.props.countHeader')
      this.setState({ countHeader: nextProps.countHeader });
    }
  }


  componentDidMount() {


    setInterval(() => {
      this.props.getCountHeader(this.props.channel.currentChannel);
      this.props.getLatestBlock(this.props.channel.currentChannel,0);
    }, 3000)

  }

  componentDidUpdate(prevProps, prevState) {
  }

  handleClickTransactionView() {
    this.setState({ activeView: 'TransactionView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        peersTab: false,
        blocksTab: false,
        txTab: true,
        chaincodesTab: false      }
    });
  }
  handleClickBlockView() {
    this.setState({ activeView: 'BlockView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        peersTab: false,
        blocksTab: true,
        txTab: false,
        chaincodesTab: false
      }
    });
  }
  handleClickChannelView() {
    this.setState({ activeView: 'ChannelView' });
  }
  handleClickPeerView() {
    this.setState({ activeView: 'PeerView' });
    this.setState({
      activeTab: {
        dashboardTab: false,
        peersTab: true,
        blocksTab: false,
        txTab: false,
        chaincodesTab: false
      }
    });
  }
  handleClickDashboardView() {
    this.setState({ activeView: 'DashboardView' });
    this.setState({
      activeTab: {
        dashboardTab: true,
        peersTab: false,
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
        peersTab: false,
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
        currentView = <Transactions channel={this.props.channel} countHeader={this.props.countHeader} transactionList={this.props.transactionList.rows} getTransactionList={this.props.getTransactionList} transaction={this.props.transaction} getTransactionInfo={this.props.getTransactionInfo}/>;
        break;
      case 'BlockView':
        currentView = <Blocks blockList={this.props.blockList} channel={this.props.channel} countHeader={this.props.countHeader} getBlockList={this.props.getBlockList} transaction={this.props.transaction} getTransactionInfo={this.props.getTransactionInfo} />;
        break;
      case 'ChannelView':
        currentView = <Channels channelList={this.props.channelList} />;
        break;
      case 'PeerView':
        currentView = <Peers peerList={this.props.peerList} />;
        break;
      case 'DashboardView':
        currentView = <DashboardView />;
        break;
      case 'ChaincodeView':
        currentView = <Chaincodes channel={this.props.channel} countHeader={this.props.countHeader} chaincodes={this.props.chaincodes} getChaincodes={this.props.getChaincodes}/>
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
              <NavItem active={this.state.activeTab.peersTab} onClick={this.handleClickPeerView}>NETWORK  </NavItem>
              <NavItem active={this.state.activeTab.blocksTab} onClick={this.handleClickBlockView}>BLOCKS </NavItem>
              <NavItem active={this.state.activeTab.txTab} onClick={this.handleClickTransactionView}>TRANSACTIONS</NavItem>
              <NavItem active={this.state.activeTab.chaincodesTab} onClick={this.handleClickChaincodeView }>CHAINCODES</NavItem>
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

const mapDispatchToProps = (dispatch) => ({
  getBlockList: (channel,offset) => dispatch(getBlockListCreator(channel,offset)),
  getChaincodes: (channel,offset) => dispatch(getChaincodesCreator(channel,offset)),
  getCountHeader: (curChannel) => dispatch(getCountHeaderCreator(curChannel)),
  getLatestBlock: (curChannel) => dispatch(getLatestBlockCreator(curChannel)),
  getTransactionInfo: (channel,tx_id) => dispatch(getTransactionInfoCreator(channel,tx_id)),
  getTransactionList: (curChannel,offset) => dispatch(getTransactionListCreator(curChannel,offset))
});


const mapStateToProps = state => ({
  block: state.block.block,
  blockList: state.blockList.blockList,
  chaincodes: state.chaincodes.chaincodes,
  channel: state.channel.channel,
  channelList: state.channelList.channelList,
  countHeader: state.countHeader.countHeader,
  peerList: state.peerList.peerList,
  transaction: state.transaction.transaction,
  transactionList: state.transactionList.transactionList,
});



export default compose(
  withStyles(styles, { name: 'CountHeader' }),
  connect(mapStateToProps, mapDispatchToProps),
)(MenuBar);
