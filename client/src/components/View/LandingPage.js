/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Logo from '../../static/images/Explorer_Logo.svg';
import { chartOperations, chartSelectors } from '../../state/redux/charts';
import { tableOperations, tableSelectors } from '../../state/redux/tables';
import { authOperations } from '../../state/redux/auth';
import {
	currentChannelType,
	getBlocksPerHourType,
	getBlocksPerMinType,
	getChaincodeListType,
	getChannelListType,
	getChannelType,
	getChannelsType,
	getDashStatsType,
	getPeerListType,
	getTransactionByOrgType,
	getTransactionListType,
	getTransactionPerHourType,
	getTransactionPerMinType,
	getUserListType,
	getBlockListSearchType
} from '../types';

const {
	blockPerHour,
	blockPerMin,
	blockActivity,
	channel,
	channelList,
	dashStats,
	transactionByOrg,
	transactionPerHour,
	transactionPerMin /* ,
	userList */
} = chartOperations;

const {
	blockListSearch,
	chaincodeList,
	channels,
	peerList,
	transactionList,
	transactionListSearch
} = tableOperations;

const { userlist } = authOperations;

const { currentChannelSelector } = chartSelectors;
const {
	transactionListSearchPageParamSelector,
	transactionListSearchQuerySelector,
	blockListSearchPageParamSelector,
	blockListSearchQuerySelector
} = tableSelectors;

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	/* eslint-disable */
	dark
		? (document.body.style.backgroundColor = '#4d4575')
		: (document.body.style.backgroundColor = '#f0f5f9');
	return {
		background: {
			backgroundColor: 'transparent'
		},
		content: {
			position: 'absolute',
			top: '50%',
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
			getBlockListSearch,
			blockListSearchPageParam,
			blockListSearchQuery,
			getBlocksPerHour,
			getBlocksPerMin,
			getChaincodeList,
			getChannel,
			getChannelList,
			getChannels,
			getDashStats,
			getPeerList,
			getBlockActivity,
			getTransactionByOrg,
			getTransactionList,
			getTransactionListSearch,
			getTransactionPerHour,
			getTransactionPerMin,
			updateLoadStatus,
			query,
			pageParams,
			userlist: userlistData
			// getUserList
		} = this.props;
		await getChannel();
		const { currentChannel } = this.props;

		const promiseTimeout = setTimeout(() => {
			this.setState({ hasDbError: true });
		}, 60000);

		await Promise.all([
			getBlockListSearch(
				currentChannel,
				blockListSearchQuery,
				blockListSearchPageParam
			),
			getBlocksPerHour(currentChannel),
			getBlocksPerMin(currentChannel),
			getChaincodeList(currentChannel),
			getChannelList(currentChannel),
			getChannels(),
			getDashStats(currentChannel),
			getPeerList(currentChannel),
			getBlockActivity(currentChannel),
			getTransactionByOrg(currentChannel),
			getTransactionListSearch(currentChannel, query, pageParams),
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
	getBlockListSearch: getBlockListSearchType.isRequired,
	getBlocksPerHour: getBlocksPerHourType.isRequired,
	getBlocksPerMin: getBlocksPerMinType.isRequired,
	getChaincodeList: getChaincodeListType.isRequired,
	getChannelList: getChannelListType.isRequired,
	getChannel: getChannelType.isRequired,
	getChannels: getChannelsType.isRequired,
	getDashStats: getDashStatsType.isRequired,
	getPeerList: getPeerListType.isRequired,
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
		currentChannel: currentChannelSelector(state),
		pageParams: transactionListSearchPageParamSelector(state),
		query: transactionListSearchQuerySelector(state),
		blockListSearchPageParam: blockListSearchPageParamSelector(state),
		blockListSearchQuery: blockListSearchQuerySelector(state)
	};
};

const mapDispatchToProps = {
	getBlockListSearch: blockListSearch,
	getBlocksPerHour: blockPerHour,
	getBlocksPerMin: blockPerMin,
	getChaincodeList: chaincodeList,
	getChannelList: channelList,
	getChannel: channel,
	getChannels: channels,
	getDashStats: dashStats,
	getPeerList: peerList,
	getBlockActivity: blockActivity,
	getTransactionByOrg: transactionByOrg,
	getTransactionListSearch: transactionListSearch,
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
