/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Logo from '../../static/images/Explorer_Logo.svg';
import { chartOperations, chartSelectors } from '../../state/redux/charts';
import { tableOperations } from '../../state/redux/tables';
import { authOperations } from '../../state/redux/auth';
import {
	currentChannelType,
	getBlockListType,
	getBlocksPerHourType,
	getBlocksPerMinType,
	getChaincodeListType,
	getChannelListType,
	getChannelType,
	getChannelsType,
	getDashStatsType,
	getPeerListType,
	getPeerStatusType,
	getTransactionByOrgType,
	getTransactionListType,
	getTransactionPerHourType,
	getTransactionPerMinType,
	getUserListType
} from '../types';

const {
	blockPerHour,
	blockPerMin,
	blockActivity,
	channel,
	channelList,
	dashStats,
	peerStatus,
	transactionByOrg,
	transactionPerHour,
	transactionPerMin /* ,
	userList */
} = chartOperations;

const {
	blockList,
	chaincodeList,
	channels,
	peerList,
	transactionList
} = tableOperations;

const { userlist } = authOperations;

const { currentChannelSelector } = chartSelectors;

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	/* eslint-disable */
	dark
		? (document.body.style.backgroundColor = '#242036')
		: (document.body.style.backgroundColor = '#f0f5f9');
	return {
		content: {
			marginTop: 450,
			marginLeft: 550,
			'& > h1': {
				fontSize: '40pt'
			},
			'& > div': {
				marginLeft: 150
			}
		}
	};
	/* eslint-enable */
};

export class LandingPage extends Component {
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
			},
			hasDbError: false
		};
	}

	async componentDidMount() {
		const {
			getBlockList,
			getBlocksPerHour,
			getBlocksPerMin,
			getChaincodeList,
			getChannel,
			getChannelList,
			getChannels,
			getDashStats,
			getPeerList,
			getPeerStatus,
			getBlockActivity,
			getTransactionByOrg,
			getTransactionList,
			getTransactionPerHour,
			getTransactionPerMin,
			updateLoadStatus,
			userlist: userlistData
			// getUserList
		} = this.props;
		await getChannel();
		const { currentChannel } = this.props;

		const promiseTimeout = setTimeout(() => {
			this.setState({ hasDbError: true });
		}, 60000);

		await Promise.all([
			getBlockList(currentChannel),
			getBlocksPerHour(currentChannel),
			getBlocksPerMin(currentChannel),
			getChaincodeList(currentChannel),
			getChannelList(currentChannel),
			getChannels(),
			getDashStats(currentChannel),
			getPeerList(currentChannel),
			getPeerStatus(currentChannel),
			getBlockActivity(currentChannel),
			getTransactionByOrg(currentChannel),
			getTransactionList(currentChannel),
			getTransactionPerHour(currentChannel),
			getTransactionPerMin(currentChannel),
			userlistData()
		]);
		clearTimeout(promiseTimeout);
		updateLoadStatus();
	}

	render() {
		const { hasDbError, logoStyle, settings } = this.state;
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
						Please verify your network configuration, database configuration and try
						again
					</h1>
				</div>
			);
		}
		const { classes } = this.props;
		return (
			<div className={classes.background}>
				<div className={classes.content}>
					<img src={Logo} style={logoStyle} alt="Hyperledger Logo" />
					<Slider {...settings}>
						<div>
							<h3>ACCESSING THE NETWORK</h3>
						</div>
						<div>
							<h3>CONNECTING TO CHANNEL</h3>
						</div>
						<div>
							<h3>LOADING BLOCKS</h3>
						</div>
					</Slider>
				</div>
			</div>
		);
	}
}

LandingPage.propTypes = {
	currentChannel: currentChannelType,
	getBlockList: getBlockListType.isRequired,
	getBlocksPerHour: getBlocksPerHourType.isRequired,
	getBlocksPerMin: getBlocksPerMinType.isRequired,
	getChaincodeList: getChaincodeListType.isRequired,
	getChannelList: getChannelListType.isRequired,
	getChannel: getChannelType.isRequired,
	getChannels: getChannelsType.isRequired,
	getDashStats: getDashStatsType.isRequired,
	getPeerList: getPeerListType.isRequired,
	getPeerStatus: getPeerStatusType.isRequired,
	getTransactionByOrg: getTransactionByOrgType.isRequired,
	getTransactionList: getTransactionListType.isRequired,
	getTransactionPerHour: getTransactionPerHourType.isRequired,
	getTransactionPerMin: getTransactionPerMinType.isRequired,
	userlist: getUserListType.isRequired
};

LandingPage.defaultProps = {
	currentChannel: null
};

const mapStateToProps = state => {
	return {
		currentChannel: currentChannelSelector(state)
	};
};

const mapDispatchToProps = {
	getBlockList: blockList,
	getBlocksPerHour: blockPerHour,
	getBlocksPerMin: blockPerMin,
	getChaincodeList: chaincodeList,
	getChannelList: channelList,
	getChannel: channel,
	getChannels: channels,
	getDashStats: dashStats,
	getPeerList: peerList,
	getPeerStatus: peerStatus,
	getBlockActivity: blockActivity,
	getTransactionByOrg: transactionByOrg,
	getTransactionList: transactionList,
	getTransactionPerHour: transactionPerHour,
	getTransactionPerMin: transactionPerMin,
	userlist: userlist
	//getUserList: userList
};

const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)(LandingPage);
export default withStyles(styles)(connectedComponent);
