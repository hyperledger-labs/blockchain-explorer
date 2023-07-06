/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import ChartStats from '../Charts/ChartStats';
import PeersHealth from '../Lists/PeersHealth';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import {
	blockListSearchType,
	dashStatsType,
	peerListType,
	txnListType,
	blockSearchType,
	transactionByOrgType
} from '../types';
import SearchByQuery from '../Lists/SearchByQuery';
import { connect } from 'react-redux';
import { currentChannelSelector } from '../../state/redux/charts/selectors';
import { tableOperations } from '../../state/redux/tables';

const {txnList, blockSearch} =tableOperations

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		background: {
			backgroundColor: dark ? 'rgb(36, 32, 54)' : '#f0f5f9'
		},
		view: {
			paddingTop: 85,
			paddingLeft: 0,
			width: '80%',
			marginLeft: '10%',
			marginRight: '10%'
		},
		dashboardSearch:{
			position: 'absolute',
			width: '80%'
		},
		search :{
			marginLeft:'10px'
		},
		blocks: {
			height: 175,
			marginBottom: 20,
			backgroundColor: dark ? '#453e68' : '#ffffff',
			boxShadow: dark ? '1px 2px 2px rgb(215, 247, 247)' : undefined
		},
		count: {
			marginTop: '55%',
			color: dark ? '#ffffff' : undefined
		},
		statistic: {
			display: 'block',
			float: 'left',
			height: '100%',
			width: '25%',
			textAlign: 'center',
			fontSize: '18pt',
			color: dark ? '#ffffff' : '#000000'
		},
		vdivide: {
			'&::after': {
				borderRight: `2px ${dark ? 'rgb(40, 36, 61)' : '#dff1fe'} solid`,
				display: 'block',
				height: '45%',
				bottom: '55%',
				content: "' '",
				position: 'relative'
			}
		},
		avatar: {
			justifyContent: 'center',
			marginLeft: '60%',
			marginTop: '65%'
		},
		node: {
			color: dark ? '#183a37' : '#21295c',
			backgroundColor: dark ? 'rgb(104, 247, 235)' : '#858aa6'
		},
		block: {
			color: dark ? '#1f1a33' : '#004d6b',
			backgroundColor: dark ? 'rgb(106, 156, 248)' : '#b9d6e1'
		},
		chaincode: {
			color: dark ? 'rgb(121, 83, 109)' : '#407b20',
			backgroundColor: dark ? 'rgb(247, 205, 234)' : '#d0ecda'
		},
		transaction: {
			color: dark ? 'rgb(216, 142, 4)' : '#ffa686',
			backgroundColor: dark ? 'rgb(252, 224, 174)' : '#ffeed8'
		},
		section: {
			height: 335,
			marginBottom: '2%',
			color: dark ? '#ffffff' : undefined,
			backgroundColor: dark ? '#3c3558' : undefined
		},
		center: {
			textAlign: 'center'
		}
	};
};

export class DashboardView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: [],
			hasDbError: false
		};
	}

	componentWillMount() {
		const {
			blockListSearch,
			dashStats,
			peerList,
			transactionByOrg,
			blockActivity
		} = this.props;
		if (
			blockListSearch === undefined ||
			dashStats === undefined ||
			peerList === undefined ||
			blockActivity === undefined ||
			transactionByOrg === undefined
		) {
			this.setState({ hasDbError: true });
		}
	}

	componentDidMount() {
		const { blockActivity } = this.props;
		this.setNotifications(blockActivity);
	}

	componentWillReceiveProps() {
		const { blockActivity } = this.props;
		this.setNotifications(blockActivity);
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
		const { dashStats, peerList, txnList, blockSearch, blockActivity, transactionByOrg } = this.props;
		const { hasDbError, notifications } = this.state;
		var searchError = ''
		if(typeof txnList==='string'){searchError='Txn not found'; }
		else if(typeof blockSearch==='string'){searchError='Block not found'}
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
				<div className={classes.view}>
					<div className={classes.dashboardSearch}>
						<SearchByQuery getTxnList={this.props.getTxnList} getBlockSearch={this.props.getBlockSearch}
							currentChannel={this.props.currentChannel}
							txnList={txnList} blockSearch={blockSearch}
							searchError={searchError} />
					</div>
				</div>
				<div className={classes.view}>
					<Row>
						<Col sm="12">
							<Card className={classes.blocks}>
								<div className={`${classes.statistic} ${classes.vdivide}`}>
									<Row>
										<Col sm="4">
											<Avatar className={`${classes.avatar} ${classes.block}`}>
												<FontAwesome name="cube" />
											</Avatar>
										</Col>
										<Col sm="4">
											<h1 className={classes.count}>{dashStats.latestBlock}</h1>
										</Col>
									</Row>
									BLOCKS
								</div>
								<div className={`${classes.statistic} ${classes.vdivide}`}>
									<Row>
										<Col sm="4">
											<Avatar className={`${classes.avatar} ${classes.transaction}`}>
												<FontAwesome name="list-alt" />
											</Avatar>
										</Col>
										<Col sm="4">
											<h1 className={classes.count}>{dashStats.txCount}</h1>
										</Col>
									</Row>
									TRANSACTIONS
								</div>
								<div className={`${classes.statistic} ${classes.vdivide}`}>
									<Row>
										<Col sm="4">
											<Avatar className={`${classes.avatar} ${classes.node}`}>
												<FontAwesome name="users" />
											</Avatar>
										</Col>
										<Col sm="4">
											<h1 className={classes.count}>{dashStats.peerCount}</h1>
										</Col>
									</Row>
									NODES
								</div>
								<div className={classes.statistic}>
									<Row>
										<Col sm="4">
											<Avatar className={`${classes.avatar} ${classes.chaincode}`}>
												<FontAwesome name="handshake-o" />
											</Avatar>
										</Col>
										<Col sm="4">
											<h1 className={classes.count}>{dashStats.chaincodeCount}</h1>
										</Col>
									</Row>
									CHAINCODES
								</div>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col sm="6">
							<Card className={classes.section}>
								<PeersHealth peerStatus={peerList} />
							</Card>
							<Card className={classes.section}>
								<TimelineStream
									notifications={notifications}
									blockList={blockActivity}
								/>
							</Card>
						</Col>
						<Col sm="6">
							<Card className={classes.section}>
								<ChartStats />
							</Card>
							<Card className={`${classes.section} ${classes.center}`}>
								<h5>Transactions by Organization</h5>
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
	blockListSearch: blockListSearchType.isRequired,
	dashStats: dashStatsType.isRequired,
	peerList: peerListType.isRequired,
	txnList: txnListType.isRequired,
	blockSearch: blockSearchType.isRequired,
	transactionByOrg: transactionByOrgType.isRequired
};

const mapStateToProps = state => {
	return {
		currentChannel: currentChannelSelector(state)
	}
}
const mapDispatchToProps = {
	getTxnList: txnList,
	getBlockSearch: blockSearch
};
const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)(DashboardView)
export default withStyles(styles)(connectedComponent);
