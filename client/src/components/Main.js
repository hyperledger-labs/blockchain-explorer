/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import BlocksView from './View/BlocksView';
import NetworkView from './View/NetworkView';
import TransactionsView from './View/TransactionsView';
import DashboardView from './View/DashboardView';
import PageNotFound from './View/PageNotFound';
import RolesView from './View/RolesView';
import DomainsView from './View/DomainsView';
import AccountsView from './View/AccountsView';

import Private from './Route';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		main: {
			color: dark ? '#ffffff' : undefined
		}
	};
};

export const Main = props => {
	const {
		classes,
	} = props;

	return (
		<Router>
			<div className={classes.main}>
				<Switch>
					<Private
						exact
						path="/"
						component={DashboardView}
					/>
					<Private
						exact
						path="/blocks"
						component={BlocksView}
					/>
					<Private
						exact
						path="/network"
						component={NetworkView}
					/>
					<Private
						exact
						path="/transactions"
						component={TransactionsView}
					/>
					<Private
						exact
						path="/roles"
						component={RolesView}
					/>
					<Private
						exact
						path="/domains"
						component={DomainsView}
					/>
					<Private
						exact
						path="/accounts"
						component={AccountsView}
					/>
					<Route exact component={PageNotFound} />
				</Switch>
			</div>
		</Router>
	);
};

export default compose(
	withStyles(styles),
)(Main);
