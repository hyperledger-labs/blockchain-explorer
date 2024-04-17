/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import FileInput from './FileInput';

const styles = theme => ({
	container: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	form: {
		width: 310
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 130
	},
	fileField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 300
	},
	menu: {
		width: 200
	},
	button: {
		fontSize: 16,
		color: '#466bd4',
		margin: 'auto',
		display: 'block',
		border: 'none'
	}
});

class ChannelForm extends Component {
	render() {
		const { classes } = this.props;

		return (
			// TODO : Replace with liform-react
			<div>
				<form className={classes.container}>
					<TextField
						id="channel-name"
						label="Name"
						className={classes.textField}
						margin="normal"
					/>
					<TextField
						id="org-name"
						label="Org Name"
						className={classes.textField}
						margin="normal"
					/>
				</form>
				<form className={classes.form}>
					<FileInput
						id="org-path"
						label="Org Path"
						helperText="path to org config"
					/>
					<FileInput
						id="channel-path"
						label="Channel Path"
						helperText="path to channel config"
					/>
					<FileInput
						id="network-path"
						label="Network Path"
						helperText="path to network config"
					/>
					<Button className={classes.button}>Submit</Button>
				</form>
			</div>
		);
	}
}

export default withStyles(styles)(ChannelForm);
