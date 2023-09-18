/**
 *    SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
	Nav,
	Navbar,
	NavbarBrand,
	NavbarToggler,
	Collapse,
	NavItem,
	Form,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
} from 'reactstrap';
import { HashRouter as Router, NavLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import FontAwesome from 'react-fontawesome';
import Drawer from '@material-ui/core/Drawer';
import Websocket from 'react-websocket';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import Loader from 'react-loader-spinner';
import Select from '../Styled/Select';
import NotificationsPanel from '../Panels/NotificationsPanel';
import Logo from '../../static/images/Explorer_Logo.svg';
import AdminPanel from '../Panels/AdminPanel';
import { chartOperations, chartSelectors } from '../../state/redux/charts';
import { tableOperations, tableSelectors } from '../../state/redux/tables';
import { themeSelectors } from '../../state/redux/theme';
import UsersPanal from '../UsersPanal/UsersPanal';
import { authOperations } from '../../state/redux/auth';

// import Enroll from '../Enroll';

import {
	currentChannelType,
	channelsType,
	getBlocksPerHourType,
	getBlocksPerMinType,
	getChaincodeListType,
	getChannelsType,
	getChangeChannelType,
	getDashStatsType,
	getPeerListType,
	getTransactionByOrgType,
	getTransactionPerHourType,
	getTransactionPerMinType,
	refreshType,
	getBlockListSearchType
} from '../types';
import { Tooltip } from '@material-ui/core';

const {
	blockPerHour,
	blockPerMin,
	transactionPerHour,
	transactionPerMin,
	transactionByOrg,
	dashStats,
	changeChannel,
	blockActivity
} = chartOperations;

const {
	blockListSearch,
	chaincodeList,
	channels,
	peerList,
	transactionList,
	transactionListSearch
} = tableOperations;

const { currentChannelSelector } = chartSelectors;
const {
	channelsSelector,
	transactionListSearchPageParamSelector,
	transactionListSearchQuerySelector,
	blockListSearchPageParamSelector,
	blockListSearchQuerySelector
} = tableSelectors;
/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	const darkNavbar = dark && {
		background: 'linear-gradient(to right, rgb(236, 233, 252), #4d4575)'
	};
	return {
		logo: {
			width: 260,
			height: 50,
			'@media (max-width: 1415px) and (min-width: 990px)': {
				width: 200,
				height: 40
			}
		},
		navbarHeader: {
			backgroundColor: '#e8e8e8',
			...darkNavbar
		},
		tab: {
			color: dark ? '#242036' : '#000000',
			fontSize: '1.05rem',
			fontWeight: 800,
			height: 50,
			margin: 10,
			'&:hover': {
				color: dark ? '#242036' : '#000000'
			},
			'@media (max-width: 1415px) and (min-width: 990px)': {
				fontSize: '0.85rem'
			}
		},
		activeTab: {
			color: '#ffffff',
			backgroundColor: dark ? '#453e68' : '#58c5c2',
			height: 60,
			marginTop: 20,
			padding: 10,
			'&:hover': {
				color: '#ffffff'
			},
			'@media (max-width: 1415px) and (min-width: 990px)': {
				padding: '8%'
			}
		},
		adminButton: {
			paddingTop: '4px',
			marginTop: 0
		},
		themeSwitch: {
			// height: 50,
			// lineHeight: '50px',
			textAlign: 'center',
			margin: '0 8px 8px 8px'
			// width: 100,
			// paddingTop: 0,
			// '@media (max-width: 1415px) and (min-width: 990px)': {
			// 	display: 'flex'
			// },
			// '@media (max-width: 990px)': {
			// 	marginLeft: 0
			// }
		},
		bell: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '18pt',
			margin: '8px',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			paddingLeft: '12px'
		},
		userdropdown: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '20pt',
			margin: '8px',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			paddingLeft: '12px'
		},
		channel: {
			width: 200,
			margin: 8,
			float: 'none',
			'@media (max-width: 1415px) and (min-width: 990px)': {
				width: '9em'
			}
		},
		channelLoader: {
			textAlign: 'center',
			padding: 20
		},
		loader: {
			margin: '0 auto',
			width: 100
		},
		sunIcon: {
			color: dark ? 'rgb(247, 200, 92)' : 'rgb(245, 185, 47)',
			margin: '8px -12px 8px 8px',
			'@media (max-width: 1415px) and (min-width: 990px)': {
				margin: 8
			},
			fontSize: '18pt'
		},
		moonIcon: {
			color: dark ? '#9cd7f7' : 'rgb(104, 195, 245)',
			margin: '8px 8px 8px -12px',
			paddingLeft: '0',
			'@media (max-width: 1415px) and (min-width: 990px)': {
				margin: 8
			},
			fontSize: '18pt'
		},
		logout: {
			fontSize: '18pt',
			margin: 8
		},
		logoutIcon: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '16pt',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			margin: '8px',
			cursor: 'pointer'
		},
		userIcon: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '16pt',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			margin: 8,
			cursor: 'pointer'
		},
		toggleIcon: {
			color: dark ? '#242136' : '#58c5c2',
			fontSize: '1.75em',
			'&:focus': {
				outline: 'none'
			}
		}
	};
};

export class HeaderView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			notifyDrawer: false,
			adminDrawer: false,
			channels: [],
			notifyCount: 0,
			notifications: [],
			isLoading: true,
			modalOpen: false,
			registerOpen: false,
			selectedChannel: {},
			dropdownOpen: false
		};
	}

	componentDidMount() {
		const { channels: channelArr, currentChannel } = this.props;
		const arr = [];
		let selectedValue = {};
		channelArr.forEach(element => {
			if (element.channel_genesis_hash === currentChannel) {
				selectedValue = {
					value: element.channel_genesis_hash,
					label: element.channelname
				};
			}
			arr.push({
				value: element.channel_genesis_hash,
				label: element.channelname
			});
		});
		this.setState({
			currentChannel: currentChannel,
			channels: arr,
			isLoading: false,
			selectedChannel: selectedValue
		});

		this.interVal = setInterval(() => {
			this.syncData(currentChannel);
		}, 60000);
	}

	componentWillUnmount() {
		clearInterval(this.interVal);
	}

	componentWillReceiveProps(nextProps) {
		const { currentChannel, getChangeChannel } = this.props;
		const options = [];
		let selectedValue = {};
		if (nextProps.channels.length > 0) {
			nextProps.channels.forEach(element => {
				options.push({
					value: element.channel_genesis_hash,
					label: (
						<Tooltip
							placement="right"
							title={
								element?.agoBlockTimes ? `Updated ${element?.agoBlockTimes} ago` : ''
							}
							arrow
						>
							<div>{element.channelname}</div>
						</Tooltip>
					)
				});
				if (
					nextProps.currentChannel == null ||
					nextProps.currentChannel === undefined
				) {
					if (element.channel_genesis_hash != null) {
						selectedValue = {
							value: element.channel_genesis_hash,
							label: element.channelname
						};
					}
				} else if (element.channel_genesis_hash === nextProps.currentChannel) {
					selectedValue = {
						value: element.channel_genesis_hash,
						label: element.channelname
					};
				}
			});
		}

		if (
			nextProps.currentChannel === null ||
			nextProps.currentChannel === undefined
		) {
			getChangeChannel(selectedValue.value);
		}

		this.setState({
			currentChannel: currentChannel,
			channels: options,
			isLoading: false,
			selectedChannel: selectedValue
		});
		if (nextProps.currentChannel !== currentChannel) {
			this.syncData(nextProps.currentChannel);
		}
	}

	toggle = () => {
		const { isOpen } = this.state;
		if (window.matchMedia('(max-width:992px)').matches) {
			this.setState({
				isOpen: !isOpen
			});
		}
	};

	closeToggle = () => this.state.isOpen && this.toggle();

	handleChange = async selectedChannel => {
		if (this.state.channels.length > 1) {
			const { getChangeChannel } = this.props;
			clearInterval(this.interVal);
			await this.handleOpen();
			this.setState({ selectedChannel });
			getChangeChannel(selectedChannel.value);
			await this.syncData(selectedChannel.value);
			this.interVal = setInterval(() => {
				this.syncData(selectedChannel.value);
			}, 60000);
		}
		//  this.handleClose();
	};

	handleOpen = () => {
		this.setState({ modalOpen: true });
	};

	handleClose = () => {
		this.setState({ modalOpen: false });
	};

	registerOpen = () => {
		this.setState(() => ({ registerOpen: true }));
	};

	registerClose = () => {
		this.setState(() => ({ registerOpen: false }));
	};

	onRegister = () => {
		this.registerClose();
	};

	logout = async () => {
		const result = await this.props.logout();
		if (result.status === 'Success') {
			window.location = '/';
		}
	};

	/**enrollOpen = () => {
    this.setState(() => ({ enrollOpen: true }));
  };

  enrollClose = () => {
    this.setState(() => ({ enrollOpen: false }));
  };

  onEnroll = user => {
    alert(JSON.stringify(user, null, 2));
    this.enrollClose();
  }; */

	handleDrawOpen = drawer => {
		switch (drawer) {
			case 'notifyDrawer': {
				this.setState({ notifyDrawer: true });
				this.setState({ notifyCount: 0 });
				break;
			}
			case 'adminDrawer': {
				this.setState({ adminDrawer: true });
				break;
			}
			default: {
				break;
			}
		}
	};

	handleDrawClose = drawer => {
		switch (drawer) {
			case 'notifyDrawer': {
				this.setState({ notifyDrawer: false });
				break;
			}
			case 'adminDrawer': {
				this.setState({ adminDrawer: false });
				break;
			}
			default: {
				break;
			}
		}
	};

	handleThemeChange = mode => {
		const { refresh } = this.props;
		refresh(mode === 'dark' ? 'light' : 'dark');
	};

	handleData(notification) {
		// this.props.getNotification(notification);
		const { notifications, notifyCount, currentChannel } = this.state;
		const notifyArr = notifications;
		notifyArr.unshift(JSON.parse(notification));
		this.setState({ notifications: notifyArr });
		this.setState({ notifyCount: notifyCount + 1 });
		this.syncData(currentChannel);
	}

	async reloadChannels() {
		const { getChannels } = this.props;
		await getChannels();
	}

	async syncData(currentChannel) {
		const {
			getBlockListSearch,
			blockListSearchPageParam,
			blockListSearchQuery,
			getBlocksPerHour,
			getBlocksPerMin,
			getChaincodeList,
			getChannels,
			getDashStats,
			getPeerList,
			getTransactionByOrg,
			getTransactionList,
			getTransactionListSearch,
			transactionListSearchPageParam,
			transactionListSearchQuery,
			getTransactionPerHour,
			getTransactionPerMin,
			getBlockActivity
		} = this.props;

		await Promise.all([
			getBlockListSearch(
				currentChannel,
				blockListSearchQuery,
				blockListSearchPageParam
			),
			getBlocksPerHour(currentChannel),
			getBlocksPerMin(currentChannel),
			getChaincodeList(currentChannel),
			getChannels(),
			getDashStats(currentChannel),
			getBlockActivity(currentChannel),
			getPeerList(currentChannel),
			getTransactionByOrg(currentChannel),
			getTransactionListSearch(
				currentChannel,
				transactionListSearchQuery,
				transactionListSearchPageParam
			),
			getTransactionPerHour(currentChannel),
			getTransactionPerMin(currentChannel)
		]);
		this.handleClose();
	}

	render() {
		const { mode, classes } = this.props;
		const { hostname, port } = window.location;
		const webSocketProtocol =
			window.location.protocol === 'https:' ? 'wss' : 'ws';
		const webSocketUrl = `${webSocketProtocol}://${hostname}:${port}/`;
		const dark = mode === 'dark';
		const {
			isLoading,
			selectedChannel,
			channels: stateChannels,
			notifyCount,
			notifyDrawer,
			adminDrawer,
			modalOpen,
			registerOpen,
			notifications,
			dropdownOpen
		} = this.state;
		const links = [
			{ to: '/', label: 'DASHBOARD', exact: true },
			{ to: '/network', label: 'NETWORK' },
			{ to: '/blocks', label: 'BLOCKS' },
			{ to: '/transactions', label: 'TRANSACTIONS' },
			{ to: '/chaincodes', label: 'CHAINCODES' },
			{ to: '/channels', label: 'CHANNELS' }
		];

		return (
			<div>
				{/* production */}
				{/* development */}
				<Websocket
					url={webSocketUrl}
					onMessage={this.handleData.bind(this)}
					reconnect
				/>
				<Router>
					<div>
						<Navbar className={classes.navbarHeader} expand="lg" fixed="top">
							<NavbarBrand href="/">
								<img src={Logo} className={classes.logo} alt="Hyperledger Logo" />
							</NavbarBrand>
							<NavbarToggler onClick={this.toggle}>
								<FontAwesome name="bars" className={classes.toggleIcon} />
							</NavbarToggler>
							<Collapse isOpen={this.state.isOpen} navbar>
								<Nav
									className="ml-auto navbar-left"
									navbar
									onMouseLeave={this.closeToggle}
								>
									{links.map(({ to, label, ...props }) => (
										<NavItem key={to}>
											<NavLink
												to={to}
												className={classes.tab}
												activeClassName={classes.activeTab}
												onClick={this.toggle}
												{...props}
											>
												{label}
											</NavLink>
										</NavItem>
									))}
									<Form inline>
										<Select
											className={classes.channel}
											placeholder="Select Channel..."
											required
											name="form-field-name"
											isLoading={isLoading}
											value={selectedChannel}
											onChange={this.handleChange}
											onFocus={this.reloadChannels.bind(this)}
											options={stateChannels}
										/>
									</Form>
									<Form inline>
										<div className={classes.adminButton}>
											<FontAwesome
												name="bell"
												data-command="bell"
												className={classes.bell}
												onClick={() => this.handleDrawOpen('notifyDrawer')}
											/>
											<Badge badgeContent={notifyCount} color="primary" />
										</div>
									</Form>
									<Form inline>
										<Dropdown
											isOpen={dropdownOpen}
											toggle={() => this.setState({ dropdownOpen: !dropdownOpen })}
										>
											<DropdownToggle nav>
												<FontAwesome name="user" className={classes.userdropdown} />
											</DropdownToggle>
											<DropdownMenu>
												<DropdownItem>
													<div className={classes.adminButton}>
														<FontAwesome name="sun-o" className={classes.sunIcon} />
														<Switch
															className={classes.themeSwitch}
															onChange={() => this.handleThemeChange(mode)}
															checked={dark}
														/>
														<FontAwesome name="moon-o" className={classes.moonIcon} />
													</div>
												</DropdownItem>
												<DropdownItem>
													<div
														className={classes.userIcon}
														onClick={() => this.registerOpen()}
													>
														<FontAwesome name="user-plus" />
														User management
													</div>
												</DropdownItem>
												<DropdownItem divider />
												<DropdownItem>
													<div className={classes.logoutIcon} onClick={() => this.logout()}>
														<FontAwesome name="sign-out" /> Sign out
													</div>
												</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</Form>
								</Nav>
							</Collapse>
						</Navbar>
						<Drawer
							anchor="right"
							open={notifyDrawer}
							onClose={() => this.handleDrawClose('notifyDrawer')}
						>
							<div tabIndex={0} role="button">
								<NotificationsPanel notifications={notifications} />
							</div>
						</Drawer>
						<Drawer
							anchor="right"
							open={adminDrawer}
							onClose={() => this.handleDrawClose('adminDrawer')}
						>
							<div tabIndex={0} role="button">
								<AdminPanel />
							</div>
						</Drawer>
						<Dialog
							open={registerOpen}
							onClose={this.registerClose}
							fullWidth={false}
							maxWidth="md"
						>
							<UsersPanal onClose={this.registerClose} onRegister={this.onRegister} />
							{/* <Register onClose={this.registerClose} onRegister={this.onRegister} /> */}
						</Dialog>
						<Dialog
							open={modalOpen}
							onClose={this.handleClose}
							fullWidth={false}
							maxWidth="md"
						>
							<div className={classes.channelLoader}>
								<h4>Loading Channel Details</h4>
								<Loader
									type="ThreeDots"
									color="#005069"
									height={70}
									width={70}
									className={classes.loader}
								/>
							</div>
						</Dialog>
					</div>
				</Router>
			</div>
		);
	}
}

HeaderView.propTypes = {
	currentChannel: currentChannelType.isRequired,
	channels: channelsType.isRequired,
	getBlockListSearch: getBlockListSearchType.isRequired,
	getBlocksPerHour: getBlocksPerHourType.isRequired,
	getBlocksPerMin: getBlocksPerMinType.isRequired,
	getChangeChannel: getChangeChannelType.isRequired,
	getChaincodeList: getChaincodeListType.isRequired,
	getChannels: getChannelsType.isRequired,
	getDashStats: getDashStatsType.isRequired,
	getPeerList: getPeerListType.isRequired,
	getTransactionByOrg: getTransactionByOrgType.isRequired,
	getTransactionPerHour: getTransactionPerHourType.isRequired,
	getTransactionPerMin: getTransactionPerMinType.isRequired,
	refresh: refreshType.isRequired
};

const { modeSelector } = themeSelectors;

const mapStateToProps = state => {
	return {
		currentChannel: currentChannelSelector(state),
		channels: channelsSelector(state),
		mode: modeSelector(state),
		transactionListSearchPageParam: transactionListSearchPageParamSelector(state),
		transactionListSearchQuery: transactionListSearchQuerySelector(state),
		blockListSearchPageParam: blockListSearchPageParamSelector(state),
		blockListSearchQuery: blockListSearchQuerySelector(state)
	};
};

const mapDispatchToProps = {
	getBlockListSearch: blockListSearch,
	getBlocksPerHour: blockPerHour,
	getBlocksPerMin: blockPerMin,
	getChaincodeList: chaincodeList,
	getChangeChannel: changeChannel, // not in syncdata
	getChannels: channels,
	getDashStats: dashStats,
	getPeerList: peerList,
	getBlockActivity: blockActivity,
	getTransactionByOrg: transactionByOrg,
	getTransactionList: transactionList,
	getTransactionListSearch: transactionListSearch,
	getTransactionPerHour: transactionPerHour,
	getTransactionPerMin: transactionPerMin,
	logout: authOperations.logout
};

const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)(HeaderView);
export default withStyles(styles)(connectedComponent);
