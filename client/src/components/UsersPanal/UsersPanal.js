import React, { Component } from 'react';

import compose from 'recompose/compose';
import classnames from 'classnames';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { withStyles } from '@material-ui/core/styles';
import Register from '../Register/Register';
import Users from '../Lists/Users';

const styles = theme => ({
	container: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
			width: 400,
			marginLeft: 'auto',
			marginRight: 'auto'
		}
	},
	paper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
			.spacing.unit * 3}px`
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing.unit
	},
	title: {
		marginTop: theme.spacing.unit * 2
	},
	actions: {
		marginTop: theme.spacing.unit * 3
	},
	errortext: {
		fontSize: 16,
		font: 'bold',
		color: 'red'
	},
	successtext: {
		fontSize: 16,
		font: 'bold',
		color: 'green'
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		color: theme.palette.grey[500]
	}
});

export class UsersPanal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: '1',
			registerOpen: false
		};
	}

	componentDidMount() {
		this.interVal = setInterval(() => {
			//this.syncData(currentChannel);
		}, 60000);
	}
	componentWillUnmount() {
		clearInterval(this.interVal);
	}
	toggle = tab => {
		this.setState({
			activeTab: tab
		});
	};
	registerOpen = () => {
		this.setState(() => ({ registerOpen: true }));
	};

	registerClose = () => {
		console.log('close set', this.state.registerOpen);
		this.setState(() => ({ registerOpen: false }));
		console.log('register state', this.state.registerOpen);
	};
	render() {
		const { activeTab } = this.state;
		const { classes, onClose } = this.props;
		return (
			<div className={classes.container}>
				<Nav tabs>
					<NavItem>
						<NavLink
							className={classnames({
								active: activeTab === '1'
							})}
							onClick={() => {
								this.toggle('1');
							}}
						>
							USERS
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							className={classnames({
								active: activeTab === '2'
							})}
							onClick={() => {
								this.toggle('2');
							}}
						>
							ADD USER
						</NavLink>
					</NavItem>
				</Nav>
				<TabContent activeTab={activeTab}>
					<TabPane tabId="1">
						<Users onClose={onClose} />
					</TabPane>
					<TabPane tabId="2">
						<Register onClose={onClose} onRegister={this.onRegister} />
					</TabPane>
				</TabContent>
			</div>
		);
	}
}

export default compose(withStyles(styles))(UsersPanal);
