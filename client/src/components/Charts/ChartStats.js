/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimeChart from './TimeChart';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardHeader,
  CardBody
} from 'reactstrap';
import {
  blocksPerHour,
  blocksPerMin,
  txPerHour,
  txPerMin
} from '../../store/actions/charts/action-creators';
import { getChannel } from '../../store/actions/channel/action-creators';
import {
  getBlockperHour,
  getBlockPerMin,
  getTxPerHour,
  getTxPerMin,
  getChannelSelector
} from '../../store/selectors/Charts/selectors';
import classnames from 'classnames';

export class ChartStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      loading: false,
    }
  }

  toggle = (tab) => {
    this.setState({
      activeTab: tab
    });
  }

  componentDidMount() {
    setInterval(() => {
      this.props.getBlocksPerMin(this.props.channel.currentChannel);
      this.props.getBlocksPerHour(this.props.channel.currentChannel);
      this.props.getTxPerMin(this.props.channel.currentChannel);
      this.props.getTxPerHour(this.props.channel.currentChannel);
    }, 6000)
  }

  render() {
    return (
      <div className="chart-stats" >
        <Card>
          <CardHeader>
            <h5>Analytics</h5>
          </CardHeader>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}>
                  BLOCKS / HOUR
                     </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}>
                  BLOCKS / MIN
                        </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '3' })}
                  onClick={() => { this.toggle('3'); }}>
                  TX / HOUR
                        </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '4' })}
                  onClick={() => { this.toggle('4'); }}>
                  TX / MIN
                        </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <TimeChart chartData={this.props.blockPerHour} />
              </TabPane>
              <TabPane tabId="2">
                <TimeChart chartData={this.props.blockPerMin} />
              </TabPane>
              <TabPane tabId="3">
                <TimeChart chartData={this.props.txPerHour} />
              </TabPane>
              <TabPane tabId="4">
                <TimeChart chartData={this.props.txPerMin} />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default connect((state) => ({
  blockPerHour: getBlockperHour(state),
  blockPerMin: getBlockPerMin(state),
  txPerHour: getTxPerHour(state),
  txPerMin: getTxPerMin(state),
  channel: getChannelSelector(state)
}), {
    getBlocksPerHour: blocksPerHour,
    getBlocksPerMin: blocksPerMin,
    getTxPerHour: txPerHour,
    getTxPerMin: txPerMin
  })(ChartStats);
