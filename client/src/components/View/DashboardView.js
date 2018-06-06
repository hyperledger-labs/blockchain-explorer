/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import ChartStats from '../Charts/ChartStats';
import PeerGraph from '../Charts/PeerGraph';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import { Card, Row, Col, CardBody } from 'reactstrap';
import { countHeader as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import { getTxByOrg as getTxByOrgCreator } from '../../store/actions/charts/action-creators';
import FontAwesome from 'react-fontawesome';

class DashboardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.notification).length !== 0 && this.props.notification !== nextProps.notification) {
      var arr = this.state.notifications;
      arr.unshift(nextProps.notification);
      this.setState({ notifications: arr });
    }
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.props.getTxByOrg(nextProps.channel.currentChannel);
    }
  }

  componentDidMount() {
    setInterval(() => {
      this.props.getTxByOrg(this.props.channel.currentChannel);
    }, 60000);

    let arr = [];
    for (let i = 0; i < 3; i++) {
      if (this.props.blockList !== undefined) {
        const block = this.props.blockList[i];
        const notify = {
          'title': 'Block ' + block.blocknum + ' Added',
          'type': 'block',
          'time': block.createdt,
          'txcount': block.txcount,
          'datahash': block.datahash
        };
        arr.push(notify);
      }
    }
    this.setState({ notifications: arr });
  }

  render() {
    return (
      <div className="dashboard" >
        <div className="dash-stats">
          <Row>
            <Card className="count-card dark-card">
              <CardBody>
                <h1>{this.props.countHeader.countHeader.latestBlock}</h1>
                <h4> <FontAwesome name="cube" /> Blocks</h4>
              </CardBody>
            </Card>
            <Card className="count-card light-card" >
              <CardBody>
                <h1>{this.props.countHeader.countHeader.txCount}</h1>
                <h4><FontAwesome name="list-alt" /> Transactions</h4>
              </CardBody>
            </Card>
            <Card className="count-card dark-card" >
              <CardBody>
                <h1>{this.props.countHeader.countHeader.peerCount}</h1>
                <h4><FontAwesome name="users" />Nodes</h4>
              </CardBody>
            </Card>
            <Card className="count-card light-card" >
              <CardBody>
                <h1>{this.props.countHeader.countHeader.chaincodeCount}</h1>
                <h4><FontAwesome name="handshake-o" />Chaincodes</h4>
              </CardBody>
            </Card>
          </Row>
        </div>
        <Row>
          <Col lg="6">
            <ChartStats />
          </Col>
          <Col lg="6">
            <OrgPieChart txByOrg={this.props.txByOrg} />
          </Col>
        </Row>
        <Row className="lower-dash">
          <Col lg="6">
            <TimelineStream notifications={this.state.notifications} />
          </Col>
          <Col lg="6">
            <PeerGraph peerList={this.props.peerList} />
          </Col>
        </Row>
      </div >
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  getCountHeader: (curChannel) => dispatch(getCountHeaderCreator(curChannel)),
  getTxByOrg: (curChannel) => dispatch(getTxByOrgCreator(curChannel))
});

const mapStateToProps = state => ({
  countHeader: state.countHeader,
  txByOrg: state.txByOrg.txByOrg,
  channel: state.channel.channel,
  notification: state.notification.notification,
  peerList: state.peerList.peerList
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardView);
