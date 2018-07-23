/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import classnames from 'classnames';
import { chartSelectors, chartOperations } from '../../state/redux/charts';
import TimeChart from './TimeChart';
import {
  blockPerHourType,
  blockPerMinType,
  currentChannelType,
  getBlocksPerHourType,
  getBlocksPerMinType,
  getTransactionPerHourType,
  getTransactionPerMinType,
  transactionPerHourType,
  transactionPerMinType,
} from '../types';

const {
  blockPerHourSelector,
  blockPerMinSelector,
  currentChannelSelector,
  transactionPerHourSelector,
  transactionPerMinSelector,
} = chartSelectors;

export class ChartStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
    };
  }

  componentDidMount() {
    const { currentChannel } = this.props;
    setInterval(() => {
      this.syncData(currentChannel);
    }, 60000);
  }

  syncData = (currentChannel) => {
    const {
      getBlocksPerHour,
      getBlocksPerMin,
      getTransactionPerHour,
      getTransactionPerMin,
    } = this.props;

    getBlocksPerMin(currentChannel);
    getBlocksPerHour(currentChannel);
    getTransactionPerMin(currentChannel);
    getTransactionPerHour(currentChannel);
  };

   timeDataSetup = (chartData = []) => {
     let dataMax = 0;
     const displayData = chartData.map((data) => {
       if (parseInt(data.count, 10) > dataMax) {
         dataMax = parseInt(data.count, 10);
       }

       return {
         datetime: moment(data.datetime)
           .tz(moment.tz.guess())
           .format('h:mm A'),
         count: data.count,
       };
     });

     dataMax += 5;

     return {
       displayData,
       dataMax,
     };
   };

  toggle = (tab) => {
    this.setState({
      activeTab: tab,
    });
  };

  render() {
    const { activeTab } = this.state;
    const {
      blockPerHour,
      blockPerMin,
      transactionPerHour,
      transactionPerMin,
    } = this.props;

    return (
      <div className="chartCard">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '1',
              })}
              onClick={() => {
                this.toggle('1');
              }}
            >
                  BLOCKS / HOUR
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '2',
              })}
              onClick={() => {
                this.toggle('2');
              }}
            >
                  BLOCKS / MIN
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '3',
              })}
              onClick={() => {
                this.toggle('3');
              }}
            >
                  TX / HOUR
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '4',
              })}
              onClick={() => {
                this.toggle('4');
              }}
            >
                  TX / MIN
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab} className="activeChartTab">
          <TabPane tabId="1" className="TabPane">
            <TimeChart
              chartData={this.timeDataSetup(blockPerHour)}
            />
          </TabPane>
          <TabPane tabId="2">
            <TimeChart
              chartData={this.timeDataSetup(blockPerMin)}
            />
          </TabPane>
          <TabPane tabId="3">
            <TimeChart
              chartData={this.timeDataSetup(transactionPerHour)}
            />
          </TabPane>
          <TabPane tabId="4">
            <TimeChart
              chartData={this.timeDataSetup(transactionPerMin)}
            />
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

ChartStats.propTypes = {
  blockPerHour: blockPerHourType.isRequired,
  blockPerMin: blockPerMinType.isRequired,
  currentChannel: currentChannelType.isRequired,
  getBlocksPerHour: getBlocksPerHourType.isRequired,
  getBlocksPerMin: getBlocksPerMinType.isRequired,
  getTransactionPerHour: getTransactionPerHourType.isRequired,
  getTransactionPerMin: getTransactionPerMinType.isRequired,
  transactionPerHour: transactionPerHourType.isRequired,
  transactionPerMin: transactionPerMinType.isRequired,
};

export default connect(
  state => ({
    blockPerHour: blockPerHourSelector(state),
    blockPerMin: blockPerMinSelector(state),
    transactionPerHour: transactionPerHourSelector(state),
    transactionPerMin: transactionPerMinSelector(state),
    currentChannel: currentChannelSelector(state),
  }),
  {
    getBlocksPerHour: chartOperations.blockPerHour,
    getBlocksPerMin: chartOperations.blockPerMin,
    getTransactionPerHour: chartOperations.transactionPerHour,
    getTransactionPerMin: chartOperations.transactionPerMin,
  },
)(ChartStats);
