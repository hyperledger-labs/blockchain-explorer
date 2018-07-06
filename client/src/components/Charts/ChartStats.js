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
  NavLink
} from 'reactstrap';
import { chartSelectors } from '../../state/redux/charts/'
import classnames from 'classnames';
import { chartOperations } from '../../state/redux/charts/'

const {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
} = chartOperations

const {
  blockPerHourSelector,
  blockPerMinSelector,
  currentChannelSelector,
  transactionPerHourSelector,
  transactionPerMinSelector,
} = chartSelectors

export class ChartStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      loading: false
    };
    }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentChannel !== this.props.currentChannel) {
      this.syncData(nextProps.currentChannel);
    }
  }

  componentDidMount() {
    setInterval(() => {
      this.syncData(this.props.currentChannel);
    }, 60000);
  }

  syncData = currentChannel => {
    this.props.getBlocksPerMin(currentChannel);
    this.props.getBlocksPerHour(currentChannel);
    this.props.getTransactionPerMin(currentChannel);
    this.props.getTransactionPerHour(currentChannel);
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
      <div className="chartCard" >
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
            <TabContent activeTab={this.state.activeTab} className="activeChartTab">
              <TabPane tabId="1" className="TabPane">
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
                  chartData={this.timeDataSetup(this.props.transactionPerHour.rows)}
                />
              </TabPane>
              <TabPane tabId="4">
                <TimeChart
                  chartData={this.timeDataSetup(this.props.transactionPerMin.rows)}
                />
              </TabPane>
            </TabContent>
      </div>
    );
  }
}

export default connect(
  state => ({
  blockPerHour: blockPerHourSelector(state),
  blockPerMin: blockPerMinSelector(state),
  transactionPerHour: transactionPerHourSelector(state),
  transactionPerMin: transactionPerMinSelector(state),
  currentChannel: currentChannelSelector(state)
  }),
  {
    getBlocksPerHour: blockPerHour,
    getBlocksPerMin: blockPerMin,
    getTransactionPerHour: transactionPerHour,
    getTransactionPerMin: transactionPerMin
  }
)(ChartStats);
