/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	MenuItem,
	FormControl,
	FormHelperText,
	Select,
	Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FontAwesome from 'react-fontawesome';
import ChannelForm from '../Forms/ChannelForm';

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	/* istanbul ignore next */
	return {
		current: {
			color: dark ? 'rgb(42, 173, 230)' : undefined
		},
		panel: {
			color: dark ? '#ffffff' : undefined,
			backgroundColor: dark ? '#3c3558' : undefined
		},
		channel: {
			width: 200
		}
	};
};

class AdminPanel extends Component {
	handleChange = () => {};

	/* istanbul ignore next */
	render() {
		const { classes } = this.props;
		return (
			<div className={classes.panel}>
				<Typography variant="headline" className={classes.panel}>
					<FontAwesome name="cogs" className={classes.panel} /> ADMIN PANEL
				</Typography>
				<Accordion className={classes.panel}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						className={classes.panel}
					>
						<Typography variant="subheading" className={classes.panel}>
							MANAGE CHANNEL{' '}
						</Typography>
						<Typography variant="caption" className={classes.current}>
							{this.props.channel.currentChannel} <br />
						</Typography>
					</AccordionSummary>
					<AccordionDetails className={classes.panel}>
						{/* <Typography variant='subheading' color="textSecondary">
                            Select Channel
                            </Typography> */}
						<form className={classes.panel}>
							<FormControl className={`${classes.channel} ${classes.panel}`}>
								<Select
									value={20}
									onChange={this.handleChange}
									helperText="select channel"
									inputProps={{
										name: 'age',
										id: 'age-simple'
									}}
								>
									<MenuItem value="" className={classes.panel}>
										<em>None</em>
									</MenuItem>
									<MenuItem className={classes.panel} value={10}>
										mock1
									</MenuItem>
									<MenuItem className={classes.panel} value={20}>
										mychannel
									</MenuItem>
									<MenuItem className={classes.panel} value={30}>
										mock2
									</MenuItem>
								</Select>
								<FormHelperText className={classes.panel}>
									select a channel
								</FormHelperText>
							</FormControl>
						</form>
						{/* <div className='channel-dropdown'>
                                <Select
                                    placeholder='Select Channel...'
                                    required='true'
                                    name="form-field-name"
                                    value={channel}
                                    onChange={handleChange}
                                    options={channels} />
                            </div> */}
					</AccordionDetails>
				</Accordion>
				<Accordion className={classes.panel}>
					<AccordionSummary
						className={classes.panel}
						expandIcon={<ExpandMoreIcon />}
					>
						<Typography variant="subheading" className={classes.panel}>
							ADD CHANNEL
						</Typography>
					</AccordionSummary>
					<AccordionDetails className={classes.panel}>
						<ChannelForm />
					</AccordionDetails>
				</Accordion>
			</div>
		);
	}
}

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
	return {
		channelList: state.channelList.channelList,
		channel: state.channel.channel
	};
}

/* istanbul ignore next */
const connectedComponent = connect(mapStateToProps)(AdminPanel);
export default withStyles(styles)(connectedComponent);
