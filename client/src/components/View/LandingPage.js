/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Logo from '../../static/images/Explorer_Logo.svg';
import { countHeader as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import { getPeerList as getPeerListCreator } from '../../store/actions/peer/action-creators';
import { blockList as getBlockListCreator } from '../../store/actions/block/action-creators';
import { transactionList as getTransactionListCreator } from '../../store/actions/transactions/action-creators';
import { getChannelList as getChannelListCreator } from '../../store/actions/chanelList/action-creators';
import { getChannel as getChannelCreator } from '../../store/actions/channel/action-creators';
import { countHeader as getHeaderCountCreator } from '../../store/actions/header/action-creators';
import { chaincodes as getChaincodesCreator } from '../../store/actions/chaincodes/action-creators';
import { getTxByOrg as getTxByOrgCreator } from '../../store/actions/charts/action-creators';
import {
  blocksPerHour as getBlocksPerHourCreator,
  blocksPerMin as getBlocksPerMinCreator,
  txPerHour as getTxPerHourCreator,
  txPerMin as getTxPerMinCreator
} from '../../store/actions/charts/action-creators';

class LandingPage extends Component {
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
      this.props.getHeaderCount(nextProps.channel.currentChannel);
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
        {/* <h1>PREPARING EXPLORER</h1> */}
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

const mapDispatchToProps = (dispatch) => ({
  getCountHeader: (curChannel) => dispatch(getCountHeaderCreator(curChannel)),
  getHeaderCount: (curChannel) => dispatch(getHeaderCountCreator(curChannel)),
  getTxPerHour: (curChannel) => dispatch(getTxPerHourCreator(curChannel)),
  getTxPerMin: (curChannel) => dispatch(getTxPerMinCreator(curChannel)),
  getBlocksPerHour: (curChannel) => dispatch(getBlocksPerHourCreator(curChannel)),
  getBlocksPerMin: (curChannel) => dispatch(getBlocksPerMinCreator(curChannel)),
  getTransactionList: (curChannel, offset) => dispatch(getTransactionListCreator(curChannel, offset)),
  getBlockList: (curChannel, offset) => dispatch(getBlockListCreator(curChannel, offset)),
  getPeerList: (curChannel) => dispatch(getPeerListCreator(curChannel)),
  getChaincodes: (curChannel) => dispatch(getChaincodesCreator(curChannel)),
  getTxByOrg: (curChannel) => dispatch(getTxByOrgCreator(curChannel))
});

const mapStateToProps = state => ({
  countHeader: state.countHeader,
  channel: state.channel.channel
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LandingPage);
