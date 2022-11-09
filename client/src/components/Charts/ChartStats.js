/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
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
	transactionPerMinType
} from '../types';
import { Tab, Tabs } from '@material-ui/core';
import TabPanel from '../TabPanel';

const {
	blockPerHourSelector,
	blockPerMinSelector,
	currentChannelSelector,
	transactionPerHourSelector,
	transactionPerMinSelector
} = chartSelectors;

export class ChartStats extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: '1'
		};
	}

	componentDidMount() {
		this.interVal = setInterval(() => {
			const { currentChannel } = this.props;
			this.syncData(currentChannel);
		}, 60000);
	}

	componentWillUnmount() {
		clearInterval(this.interVal);
	}

	syncData = currentChannel => {
		const {
			getBlocksPerHour,
			getBlocksPerMin,
			getTransactionPerHour,
			getTransactionPerMin
		} = this.props;

		getBlocksPerMin(currentChannel);
		getBlocksPerHour(currentChannel);
		getTransactionPerMin(currentChannel);
		getTransactionPerHour(currentChannel);
	};

	timeDataSetup = (chartData = []) => {
		let dataMax = 0;
		const displayData = chartData.map(data => {
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

		dataMax += 5;

		return {
			displayData,
			dataMax
		};
	};

	toggle = tab => {
		this.setState({
			activeTab: tab
		});
	};

	render() {
		const { activeTab } = this.state;
		const {
			blockPerHour,
			blockPerMin,
			transactionPerHour,
			transactionPerMin
		} = this.props;

		return (
			<div style={{ width: '100%' }}>
				<Tabs
					value={activeTab}
					indicatorColor="primary"
					textColor="primary"
					onChange={(_, tab) => this.toggle(tab)}
					variant="scrollable"
					scrollButtons="auto"
				>
					<Tab label="BLOCKS/HOUR" value="1" />
					<Tab label="BLOCKS/MIN" value="2" />
					<Tab label="TX/HOUR" value="3" />
					<Tab label="TX/MIN" value="4" />
				</Tabs>
				<TabPanel value={activeTab} tab="1">
					<TimeChart chartData={this.timeDataSetup(blockPerHour)} />
				</TabPanel>
				<TabPanel value={activeTab} tab="2">
					<TimeChart chartData={this.timeDataSetup(blockPerMin)} />
				</TabPanel>
				<TabPanel value={activeTab} tab="3">
					<TimeChart chartData={this.timeDataSetup(transactionPerHour)} />
				</TabPanel>
				<TabPanel value={activeTab} tab="4">
					<TimeChart chartData={this.timeDataSetup(transactionPerMin)} />
				</TabPanel>
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
	transactionPerMin: transactionPerMinType.isRequired
};

const mapStateToProps = state => {
	return {
		blockPerHour: blockPerHourSelector(state),
		blockPerMin: blockPerMinSelector(state),
		transactionPerHour: transactionPerHourSelector(state),
		transactionPerMin: transactionPerMinSelector(state),
		currentChannel: currentChannelSelector(state)
	};
};

const mapDispatchToProps = {
	getBlocksPerHour: chartOperations.blockPerHour,
	getBlocksPerMin: chartOperations.blockPerMin,
	getTransactionPerHour: chartOperations.transactionPerHour,
	getTransactionPerMin: chartOperations.transactionPerMin
};

const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)(ChartStats);
export default connectedComponent;
