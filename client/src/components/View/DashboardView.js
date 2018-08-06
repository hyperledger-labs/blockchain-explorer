/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import ChartStats from '../Charts/ChartStats';
import PeersHealth from '../Lists/PeersHealth';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import {
  blockListType,
  dashStatsType,
  peerStatusType,
  transactionByOrgType
} from '../types';

export class DashboardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      hasDbError: false
    };
  }

  componentWillMount() {
    const { blockList, dashStats, peerStatus, transactionByOrg } = this.props;
    if (
      blockList === undefined ||
      dashStats === undefined ||
      peerStatus === undefined ||
      transactionByOrg === undefined
    ) {
      this.setState({ hasDbError: true });
    }
  }

  componentDidMount() {
    const { blockList } = this.props;
    this.setNotifications(blockList);
  }

  componentWillReceiveProps() {
    const { blockList } = this.props;
    this.setNotifications(blockList);
  }

  setNotifications = blockList => {
    const notificationsArr = [];
    if (blockList !== undefined) {
      for (let i = 0; i < 3 && blockList && blockList[i]; i += 1) {
        const block = blockList[i];
        const notify = {
          title: `Block ${block.blocknum} `,
          type: 'block',
          time: block.createdt,
          txcount: block.txcount,
          datahash: block.datahash,
          blockhash: block.blockhash,
          channelName: block.channelname
        };
        notificationsArr.push(notify);
      }
    }
    this.setState({ notifications: notificationsArr });
  };

  render() {
    const { dashStats, peerStatus, blockList, transactionByOrg } = this.props;
    const { hasDbError, notifications } = this.state;
    if (hasDbError) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <h1>
            Please verify your network configuration, database configuration and
            try again
          </h1>
        </div>
      );
    }
    return (
      <div className="background-view">
        <div className="dash-view">
          <Row>
            <Col sm="12">
              <Card className="stats-block ">
                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-block">
                        <FontAwesome name="cube" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{dashStats.latestBlock}</h1>
                    </Col>
                  </Row>
                  BLOCKS
                </div>
                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-tx">
                        <FontAwesome name="list-alt" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{dashStats.txCount}</h1>
                    </Col>
                  </Row>
                  TRANSACTIONS
                </div>
                <div className="statistic vdivide">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-node">
                        <FontAwesome name="users" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{dashStats.peerCount}</h1>
                    </Col>
                  </Row>
                  NODES
                </div>
                <div className="statistic">
                  <Row>
                    <Col sm="4">
                      <Avatar className="stat-avatar avatar-chaincode">
                        <FontAwesome name="handshake-o" />
                      </Avatar>
                    </Col>
                    <Col sm="4">
                      <h1 className="stat-count">{dashStats.chaincodeCount}</h1>
                    </Col>
                  </Row>
                  CHAINCODES
                </div>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <Card className="dash-section">
                <PeersHealth peerStatus={peerStatus} />
              </Card>
              <Card className="dash-section">
                <TimelineStream
                  notifications={notifications}
                  blockList={blockList}
                />
              </Card>
            </Col>
            <Col sm="6">
              <Card className="dash-section">
                <ChartStats />
              </Card>
              <Card className="dash-section center-column">
                <h5 className="org-header">Transactions by Organization</h5>
                <hr />
                <OrgPieChart transactionByOrg={transactionByOrg} />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

DashboardView.propTypes = {
  blockList: blockListType.isRequired,
  dashStats: dashStatsType.isRequired,
  peerStatus: peerStatusType.isRequired,
  transactionByOrg: transactionByOrgType.isRequired
};

export default DashboardView;
