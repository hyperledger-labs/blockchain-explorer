// SPDX-License-Identifier: Apache-2.0
import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	root: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: 'auto',
		marginRight: 'auto',
		[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
			width: 400,
			marginLeft: 'auto',
			marginRight: 'auto'
		}
	}
});

export class Container extends Component {
	render() {
		const { classes, children } = this.props;
		return <div className={classes.root}>{children}</div>;
	}
}

export default withStyles(styles)(Container);
