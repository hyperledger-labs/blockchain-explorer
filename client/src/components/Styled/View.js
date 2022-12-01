/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		fullwidth: {
			width: '100%'
			// marginTop: 105 이거 왜들어가있는거지
		},
		display: {
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto',
			backgroundColor: dark ? 'transparent' : undefined
		},
		card: {
			color: dark ? '#ffffff' : undefined,
			backgroundColor: dark ? '#453e68' : undefined
		}
	};
};

export const View = ({ children, classes }) => (
	<div className={classes.fullwidth}>
		<div className={classes.display}>
			<Card className={classes.card}>{children}</Card>
		</div>
	</div>
);

export default withStyles(styles)(View);
