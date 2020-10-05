import React, { Component } from 'react';

import classnames from 'classnames';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import Register from '../Register/Register';
import Users from '../Lists/Users';
import Container from '../Container'

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
		const { onClose } = this.props;
		return (
			<Container>
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
			</Container>
		);
	}
}

export default UsersPanal;
