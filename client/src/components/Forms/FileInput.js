/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import ButtonBase from '@material-ui/core/ButtonBase';

const styles = theme => ({
	field: {
		'& .MuiFormLabel-root.Mui-disabled': {
			color: theme.palette.text.secondary
		}
	},
	button: {
		width: '100%',
		height: '100%',
		overflow: 'hidden'
	},
	box: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		borderBottom: '1px #8b8e91 solid',
		'&:hover': {
			borderBottom: '2px #1f2020 solid'
		}
	}
});

class FileInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			attachment: null
		};
		this.ref = React.createRef();
	}

	handleChange = event => {
		const files = Array.from(event.target.files);
		const [file] = files;
		this.setState({ attachment: file });
	};

	render() {
		const { label, helperText, classes } = this.props;
		const { attachment } = this.state;

		return (
			<Box position="relative" height={98} className={classes.box}>
				<Box position="absolute" top={0} bottom={0} left={0} right={0}>
					<TextField
						variant="standard"
						className={classes.field}
						InputProps={{ disableUnderline: true }}
						margin="normal"
						fullWidth
						disabled
						label={label}
						value={attachment?.name || ''}
						helperText={helperText}
					/>
				</Box>
				<ButtonBase
					className={classes.button}
					component="label"
					onKeyDown={e => e.keyCode === 32 && this.ref.current.click()}
				>
					<input
						ref={this.ref}
						type="file"
						hidden
						onChange={this.handleChange}
						helperText={helperText}
					/>
				</ButtonBase>
			</Box>
		);
	}
}

export default withStyles(styles)(FileInput);
