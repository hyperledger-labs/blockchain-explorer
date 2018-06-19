/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ChartStats from '../Charts/ChartStats';
import PeersHealth from '../Lists/PeersHealth';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import {
  Card,
  Row,
  Col,
  CardBody
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

export class DashboardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setNotifications(this.props.blockList)
  }

  componentDidMount() {
    this.setNotifications(this.props.blockList)
  }

  setNotifications = (blockList) => {
    let notificationsArr = [];
    if (blockList !== undefined) {
      for (let i = 0; i < 3 && this.props.blockList && this.props.blockList[i]; i++) {
        const block = this.props.blockList[i];
        const notify = {
          'title': `Block ${block.blocknum} Added`,
          'type': 'block',
          'time': block.createdt,
          'txcount': block.txcount,
          'datahash': block.datahash
        };
        notificationsArr.push(notify);
      }
    }
    this.setState({ notifications: notificationsArr });
  }

  render() {
    return (
      <div className="view-fullwidth" >
        <div className="dashboard" >
          <div className="dash-stats">
            <Row>
              <Card className="count-card dark-card">
                <CardBody>
                  <h1>{this.props.countHeader.latestBlock}</h1>
                  <h4> <FontAwesome name="cube" /> Blocks</h4>
                </CardBody>
              </Card>
              <Card className="count-card light-card" >
                <CardBody>
                  <h1>{this.props.countHeader.txCount}</h1>
                  <h4><FontAwesome name="list-alt" /> Transactions</h4>
                </CardBody>
              </Card>
              <Card className="count-card dark-card" >
                <CardBody>
                  <h1>{this.props.countHeader.peerCount}</h1>
                  <h4><FontAwesome name="users" />Nodes</h4>
                </CardBody>
              </Card>
              <Card className="count-card light-card" >
                <CardBody>
                  <h1>{this.props.countHeader.chaincodeCount}</h1>
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
              <PeersHealth peerStatus={this.props.peerStatus} channel={this.props.channel.currentChannel} />
            </Col>
          </Row>
        </div >
      </div>
    );
  }
}

export default DashboardView
