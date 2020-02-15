/**
 *    SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Nav from 'reactstrap/lib/Nav';
import Navbar from 'reactstrap/lib/Navbar';
import NavbarBrand from 'reactstrap/lib/NavbarBrand';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
import Collapse from 'reactstrap/lib/Collapse';
import { HashRouter as Router, NavLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import FontAwesome from 'react-fontawesome';
import Drawer from '@material-ui/core/Drawer';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import Loader from 'react-loader-spinner';
import Select from '../Styled/Select';
import NotificationsPanel from '../Panels/NotificationsPanel';
import Logo from '../../static/images/Explorer_Logo.svg';
import { themeSelectors } from '../../state/redux/theme';

import Register from '../Register';

// import Enroll from '../Enroll';

import {
	refreshType
} from '../types';

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
			paddingTop: 0,
			marginTop: 0
		},
		themeSwitch: {
			height: 50,
			lineHeight: '50px',
			textAlign: 'center',
			marginLeft: 15,
			width: 100,
			paddingTop: 0,
			'@media (max-width: 1415px) and (min-width: 990px)': {
				display: 'flex'
			},
			'@media (max-width: 990px)': {
				marginLeft: 0
			}
		},
		bell: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '18pt',
			margin: 8,
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			}
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
			'@media (max-width: 1415px) and (min-width: 990px)': {
				marginTop: 15
			}
		},
		moonIcon: {
			color: dark ? '#9cd7f7' : 'rgb(104, 195, 245)',
			'@media (max-width: 1415px) and (min-width: 990px)': {
				marginTop: 15
			}
		},
		signout: {
			marginRight: -3
		},
		signoutIcon: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '18pt',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			marginLeft: 5,
			marginTop: 14,
			cursor: 'pointer'
		},
		user: {
			marginRight: -3
		},
		userIcon: {
			color: dark ? 'rgb(139, 143, 148)' : '#5f6164',
			fontSize: '18pt',
			float: 'none',
			'&:hover': {
				color: dark ? '#c1d7f0' : '#24272a'
			},
			marginLeft: 5,
			marginTop: 14,
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
			selectedChannel: {}
		};
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
			channels,
			notifyCount,
			notifyDrawer,
			modalOpen,
			registerOpen,
			notifications
		} = this.state;

		const links = [
			{ to: '/', label: 'DASHBOARD', exact: true },
			{ to: '/network', label: 'NETWORK' },
			{ to: '/blocks', label: 'BLOCKS' },
			{ to: '/transactions', label: 'TRANSACTIONS' },
			{ to: '/roles', label: 'ROLES' },
			{ to: '/domains', label: 'DOMAINS' },
			{ to: '/accounts', label: 'ACCOUNTS' },
		];

		return (
			<div>
				{/* production */}
				{/* development */}
				<Router>
					<div>
						<Navbar className={classes.navbarHeader} expand="lg" fixed="top">
							<NavbarBrand href="/">
								{' '}
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
										<li key={to}>
											<NavLink
												to={to}
												className={classes.tab}
												activeClassName={classes.activeTab}
												onClick={this.toggle}
												{...props}
											>
												{label}
											</NavLink>
										</li>
									))}
									{
										<div className={classes.adminButton}>
											<FontAwesome
												name="bell"
												data-command="bell"
												className={classes.bell}
												onClick={() => this.handleDrawOpen('notifyDrawer')}
											/>
											<Badge badgeContent={notifyCount} color="primary"> </Badge>
										</div>
									}
									{/*
							//Use when Admin functionality is required
							<div className={classes.adminButton}>
								<FontAwesome
									name='cog'
									className='cog'
									onClick={() => this.handleDrawOpen('adminDrawer')}
								/>
							</div> */}
									<div className={`${classes.adminButton} ${classes.themeSwitch}`}>
										<FontAwesome name="sun-o" className={classes.sunIcon} />
										<Switch
											onChange={() => this.handleThemeChange(mode)}
											checked={dark}
										/>
										<FontAwesome name="moon-o" className={classes.moonIcon} />
									</div>
									<div className={classNames(classes.adminButton, classes.user)}>
										<FontAwesome
											name="user-plus"
											className={classes.userIcon}
											onClick={() => this.registerOpen()}
										/>
									</div>
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
						<Dialog
							open={registerOpen}
							onClose={this.registerClose}
							fullWidth={false}
							maxWidth="md"
						>
							<Register onClose={this.registerClose} onRegister={this.onRegister} />
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
	refresh: refreshType.isRequired
};

const { modeSelector } = themeSelectors;

export default compose(
	withStyles(styles),
	connect(
		state => ({
			mode: modeSelector(state)
		}),
	)
)(HeaderView);
