/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimeChart from './TimeChart';
import moment from 'moment-timezone';
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
import {
  getBlockperHour,
  getBlockPerMin,
  getTxPerHour,
  getTxPerMin,
  getChannelSelector
} from '../../store/selectors/selectors';
import classnames from 'classnames';

export class ChartStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      loading: false
    };
    }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.syncData(nextProps.channel.currentChannel);
    }
  }

  componentDidMount() {
    setInterval(() => {
      this.syncData(this.props.channel.currentChannel);
    }, 6000);
  }

  syncData = currentChannel => {
    this.props.getBlocksPerMin(currentChannel);
    this.props.getBlocksPerHour(currentChannel);
    this.props.getTxPerMin(currentChannel);
    this.props.getTxPerHour(currentChannel);
  };

   timeDataSetup = (chartData = []) => {
    let displayData;
    let dataMax = 0;

    displayData = chartData.map(data => {
        if (parseInt(data.count, 10) > dataMax) {
        dataMax = parseInt(data.count, 10);
        }

        return {
        datetime: moment(data.datetime)
          .tz(moment.tz.guess())
          .format('h:mm A'),
          count: data.count
      };
    });

    dataMax = dataMax + 5;

    return {
      displayData: displayData,
      dataMax: dataMax
    };
  };

  toggle = tab => {
    this.setState({
      activeTab: tab
    });
  };

  render() {
    return (
      <div className="chart-stats">
        <Card>
          <CardHeader>
            <h5>Analytics</h5>
          </CardHeader>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.activeTab === "1"
                  })}
                  onClick={() => {
                    this.toggle("1");
                  }}
                >
                  BLOCKS / HOUR
                     </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.activeTab === "2"
                  })}
                  onClick={() => {
                    this.toggle("2");
                  }}
                >
                  BLOCKS / MIN
                        </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.activeTab === "3"
                  })}
                  onClick={() => {
                    this.toggle("3");
                  }}
                >
                  TX / HOUR
                        </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.activeTab === "4"
                  })}
                  onClick={() => {
                    this.toggle("4");
                  }}
                >
                  TX / MIN
                        </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <TimeChart
                  chartData={this.timeDataSetup(this.props.blockPerHour.rows)}
                />
              </TabPane>
              <TabPane tabId="2">
                <TimeChart
                  chartData={this.timeDataSetup(this.props.blockPerMin.rows)}
                />
              </TabPane>
              <TabPane tabId="3">
                <TimeChart
                  chartData={this.timeDataSetup(this.props.txPerHour.rows)}
                />
              </TabPane>
              <TabPane tabId="4">
                <TimeChart
                  chartData={this.timeDataSetup(this.props.txPerMin.rows)}
                />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default connect(
  state => ({
  blockPerHour: getBlockperHour(state),
  blockPerMin: getBlockPerMin(state),
  txPerHour: getTxPerHour(state),
  txPerMin: getTxPerMin(state),
  channel: getChannelSelector(state)
  }),
  {
    getBlocksPerHour: blocksPerHour,
    getBlocksPerMin: blocksPerMin,
    getTxPerHour: txPerHour,
    getTxPerMin: txPerMin
  }
)(ChartStats);
