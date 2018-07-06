/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ChartStats from '../Charts/ChartStats';
import PeersHealth from '../Lists/PeersHealth';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import {
  Row,
  Col
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Card from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';

export class DashboardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setNotifications(this.props.blockList);
  }

  componentDidMount() {
    this.setNotifications(this.props.blockList);
  }

  setNotifications = blockList => {
    let notificationsArr = [];
    if (blockList !== undefined) {
      for (
        let i = 0;
        i < 3 && blockList && blockList[i];
        i++
      ) {
        const block = blockList[i];
        const notify = {
          title: `Block ${block.blocknum} `,
          type: "block",
          time: block.createdt,
          txcount: block.txcount,
          datahash: block.datahash,
          blockhash: block.blockhash
        };
        notificationsArr.push(notify);
      }
    }
    this.setState({ notifications: notificationsArr });
  };

  render() {
    return (
      <div className="background-view">
        <div className="dash-view" >
          <Row>
            <Col sm="12">
              <Card className="stats-block ">

                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-block" >
                        <FontAwesome name="cube" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{this.props.dashStats.latestBlock}</h1>
                    </Col>
                  </Row>
                  BLOCKS
                    </div>
                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-tx" >
                        <FontAwesome name="list-alt" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{this.props.dashStats.txCount}</h1>
                    </Col>
                  </Row>
                  TRANSACTIONS
                   </div>
                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-node" >
                        <FontAwesome name="users" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{this.props.dashStats.peerCount}</h1>
                    </Col>
                  </Row>
                  NODES
                  </div>
                <div className="statistic">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-chaincode" >
                        <FontAwesome name="handshake-o" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{this.props.dashStats.chaincodeCount}</h1>
                    </Col>
                  </Row>
                  CHAINCODES
                  </div>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm="6" >
              <Card className="dash-section">
                <PeersHealth
                  peerStatus={this.props.peerStatus}
                />
              </Card>
              <Card className="dash-section">
                <TimelineStream notifications={this.state.notifications} blockList={this.props.blockList} />
              </Card>
            </Col>
            <Col sm="6">
              <Card className="dash-section">
                <ChartStats />
              </Card>
              <Card className="dash-section center-column">
                <h5 className="org-header">Transactions by Organziation</h5>
                <hr />
                <OrgPieChart transactionByOrg={this.props.transactionByOrg} />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default DashboardView;
