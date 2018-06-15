/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import Logo from '../../static/images/Explorer_Logo.svg';
import { countHeader } from '../../store/actions/header/action-creators';
import { peerList, peerStatus } from '../../store/actions/peer/action-creators';
import { blockList } from '../../store/actions/block/action-creators';
import { transactionList } from '../../store/actions/transactions/action-creators';
import { chaincodes } from '../../store/actions/chaincodes/action-creators';
import { txByOrg } from '../../store/actions/charts/action-creators';
import {
  blocksPerHour,
  blocksPerMin,
  txPerHour,
  txPerMin
} from '../../store/actions/charts/action-creators';
import { getCountHeader, getChannel } from '../../store/selectors/selectors';

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.props.getPeerList(nextProps.channel.currentChannel);
      this.props.getCountHeader(nextProps.channel.currentChannel);
      this.props.getPeerStatus(nextProps.channel.currentChannel);
      this.props.getTxPerHour(nextProps.channel.currentChannel);
      this.props.getTxPerMin(nextProps.channel.currentChannel);
      this.props.getBlocksPerHour(nextProps.channel.currentChannel);
      this.props.getBlocksPerMin(nextProps.channel.currentChannel);
      this.props.getTransactionList(nextProps.channel.currentChannel, 0);
      this.props.getBlockList(nextProps.channel.currentChannel, 0);
      this.props.getTxByOrg(nextProps.channel.currentChannel);
      this.props.getChaincodes(nextProps.channel.currentChannel);
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
  countHeader: getCountHeader(state)
}), {
  getCountHeader: countHeader,
  getTxPerHour: txPerHour,
  getTxPerMin: txPerMin,
  getBlocksPerHour: blocksPerHour,
  getBlocksPerMin: blocksPerMin,
  getTransactionList: transactionList,
  getBlockList: blockList,
  getPeerList: peerList,
  getPeerStatus: peerStatus,
  getChaincodes: chaincodes,
  getTxByOrg: txByOrg
})(LandingPage)
