import { Box, Drawer, List } from '@material-ui/core';
import {
	Dashboard,
	InsertLink,
	Layers,
	NetworkCheck,
	SwapHoriz,
	Widgets
} from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { coreActions } from '../../state/redux/core';
import { drawerOpenSelector } from '../../state/redux/core/selectors';
import DrawerListItem from './DrawerListItem';
import { DRAWER_WIDTH, HEADER_HEIGHT } from '../../constants/styles';

const LINKS = [
	{ to: '/dashboard', label: 'DASHBOARD', icon: <Dashboard /> },
	{ to: '/network', label: 'NETWORK', icon: <NetworkCheck /> },
	{ to: '/blocks', label: 'BLOCKS', icon: <Widgets /> },
	{ to: '/transactions', label: 'TRANSACTIONS', icon: <SwapHoriz /> },
	{ to: '/chaincodes', label: 'CHAINCODES', icon: <InsertLink /> },
	{ to: '/channels', label: 'CHANNELS', icon: <Layers /> }
];

const styles = theme => {
	const { zIndex } = theme;

	return {
		paper: {
			position: 'fixed',
			top: 0,
			left: 0,
			width: DRAWER_WIDTH,
			height: '100%',
			display: 'flex',
			paddingTop: `calc(${HEADER_HEIGHT} + 24px)`,
			paddingBottom: '16px',
			zIndex: zIndex.appBar - 1,
			border: 'none',
			boxShadow:
				'0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)'
		},
		subtitle: {
			'& .MuiTypography-body1': {
				fontSize: '16px',
				fontWeight: 500
			}
		},
		termsSection: {
			...theme.typography.caption,
			padding: '0 25px',
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-end'
		}
	};
};

class AppDrawer extends Component {
	render() {
		const { classes, drawerOpen, toggleDrawer } = this.props;

		return (
			<Drawer
				open={drawerOpen}
				onClose={toggleDrawer}
				variant="persistent"
				PaperProps={{
					className: classes.paper
				}}
			>
				<List>
					{LINKS.map(link => (
						<DrawerListItem
							key={link.to}
							to={link.to}
							icon={link.icon}
							label={link.label}
							exact={link.exact}
						/>
					))}
				</List>
				<Box className={classes.termsSection}>
					<div>개인정보 보호 정책 ㅣ이용 약관ㅣ도움말</div>
					<div>All deefun. ⓒ 2019. Korea</div>
				</Box>
			</Drawer>
		);
	}
}

const mapStateToProps = state => {
	return {
		drawerOpen: drawerOpenSelector(state)
	};
};

const mapDispatchToProps = {
	toggleDrawer: coreActions.toggleDrawer
};

const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)(AppDrawer);

export default withStyles(styles)(connectedComponent);
