/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import clientJson from '../../../package.json';
import FabricVersion from '../../FabricVersion';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		root: {
			margin: '2%'
		},
		footer: {
			backgroundColor: dark ? '#5e558e' : '#e8e8e8',
			color: dark ? '#ffffff' : undefined,
			position: 'fixed',
			height: '40px',
			fontSize: '1.2rem',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			left: 0,
			right: 0,
			bottom: 0,
			paddingLeft: '20px',
			paddingRight: '20px'
		}
	};
};

const FooterView = ({ classes }) => (
	<div className={classes.root}>
		<div>
			<div className={classes.footer}>
				<div>
					{'Hyperledger Explorer Client Version: '}
					{clientJson.version}
					&emsp;
					{'Fabric Compatibility: '} {FabricVersion.map(v => v)}
				</div>
				<div>
					<img src="/footer_logo.svg" height={35} />
				</div>
			</div>
		</div>
	</div>
);

export default withStyles(styles)(FooterView);
