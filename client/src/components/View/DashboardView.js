/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ChartStats from '../Charts/ChartStats';
import PeersHealth from '../Lists/PeersHealth';
import TimelineStream from '../Lists/TimelineStream';
import {
	blockListType,
	dashStatsType,
	peerStatusType,
	transactionByOrgType
} from '../types';
import StatCard from '../StatCard/StatCard';
import { Grid, IconButton } from '@material-ui/core';
import { Fullscreen, SwapHoriz, Widgets } from '@material-ui/icons';
import { Link } from 'react-router-dom';

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
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
			border: `1px solid #EEEEEE`,
			backgroundColor: '#FFF',
			boxShadow: 'inset 1px -1px 0px rgba(102, 102, 102, 0.2)',
			borderRadius: '12px'
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
			blockList,
			dashStats,
			peerStatus,
			transactionByOrg,
			blockActivity
		} = this.props;
		if (
			blockList === undefined ||
			dashStats === undefined ||
			peerStatus === undefined ||
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
		const { dashStats, peerStatus, blockActivity } = this.props;
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
						Please verify your network configuration, database configuration and try
						again
					</h1>
				</div>
			);
		}
		const { classes } = this.props;

		return (
			<Grid container spacing={3}>
				<Grid item xs={6}>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<StatCard
								count={dashStats.latestBlock}
								label="BLOCKS"
								icon={<Widgets color="action" />}
							/>
						</Grid>
						<Grid item xs={6}>
							<StatCard
								count={dashStats.txCount}
								label="TRANSACTIONS"
								icon={<SwapHoriz color="action" />}
							/>
						</Grid>
						<Grid item xs>
							<TimelineStream
								notifications={notifications}
								blockList={blockActivity}
								button={
									<Link to="/dashboard/blocks">
										<IconButton>
											<Fullscreen />
										</IconButton>
									</Link>
								}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={6}>
					<Card className={classes.section}>
						<PeersHealth peerStatus={peerStatus} />
					</Card>
					<Card className={classes.section}>
						<ChartStats />
					</Card>
				</Grid>
			</Grid>
		);
	}
}

DashboardView.propTypes = {
	blockList: blockListType.isRequired,
	dashStats: dashStatsType.isRequired,
	peerStatus: peerStatusType.isRequired,
	transactionByOrg: transactionByOrgType.isRequired
};

export default withStyles(styles)(DashboardView);
