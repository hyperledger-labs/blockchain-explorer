/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import Logo from '../../static/images/Explorer_Logo.svg';
import { getDashStats, getChannel, getChannelList } from '../../store/selectors/selectors';
import chartsOperations from '../../state/redux/charts/operations'
import tablesOperations from '../../state/redux/tables/operations'
const {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
  transactionByOrg,
  notification,
  dashStats,
  channel,
  channelList,
  changeChannel,
  peerStatus
} = chartsOperations

const {
  blockList,
  chaincodeList,
  channels,
  peerList,
  transactionInfo,
  transactionList
} = tablesOperations



export class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: false,
        accessibility: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
      },
      logoStyle: {
        width: '520px',
        height: '100px'
      }
    }
  }

  componentDidMount() {
    this.props.getChannels()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.props.getBlockList(nextProps.channel.currentChannel, 0);
      this.props.getBlocksPerHour(nextProps.channel.currentChannel);
      this.props.getBlocksPerMin(nextProps.channel.currentChannel);
      this.props.getChaincodeList(nextProps.channel.currentChannel);
      this.props.getChannels()
      this.props.getDashStats(nextProps.channel.currentChannel);
      this.props.getPeerList(nextProps.channel.currentChannel);
      this.props.getPeerStatus(nextProps.channel.currentChannel);
      this.props.getTransactionList(nextProps.channel.currentChannel, 0);
      this.props.getTransactionByOrg(nextProps.channel.currentChannel);
      this.props.getTransactionPerHour(nextProps.channel.currentChannel);
      this.props.getTransactionPerMin(nextProps.channel.currentChannel);
    }
  }

  render() {
    return (
      <div className="landing" >
        <img src={Logo} style={this.state.logoStyle} alt="Hyperledger Logo" />
        <Slider {...this.state.settings}>
          <div><h3>ACCESSING THE NETWORK</h3></div>
          <div><h3>CONNECTING TO CHANNEL</h3></div>
          <div><h3>LOADING BLOCKS</h3></div>
        </Slider>
      </div>
    );
  }
}

export default connect((state) => ({
  channel: getChannel(state),
  channelList: getChannelList,
  dashStats: getDashStats(state)
}), {
    getBlockList: blockList,
    getBlocksPerHour: blockPerHour,
    getBlocksPerMin: blockPerMin,
    getChaincodeList: chaincodeList,
    getChannels: channels,
    getDashStats: dashStats,
    getPeerList: peerList,
    getPeerStatus: peerStatus,
    getTransactionByOrg: transactionByOrg,
    getTransactionList: transactionList,
    getTransactionPerHour: transactionPerHour,
    getTransactionPerMin: transactionPerMin,
  })(LandingPage)
