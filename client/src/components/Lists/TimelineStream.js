/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Timeline } from 'react-event-timeline';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import find from 'lodash/find';
import BlockView from '../View/BlockView';
import { blockListType, notificationsType } from '../types';
import { Divider } from '@material-ui/core';
import TimelineItem from '../TimelineItem/TimelineItem';

/* istanbul ignore next */
const styles = theme => {
	return {
		card: {
			border: `1px solid #EEEEEE`,
			backgroundColor: '#FFF',
			boxShadow: 'inset 1px -1px 0px rgba(102, 102, 102, 0.2)',
			borderRadius: '12px'
		},
		title: {
			display: 'flex',
			justifyContent: 'space-between',
			padding: '24px',
			fontWeight: 500
		},
		open: {
			height: 35,
			marginTop: -10,
			backgroundColor: 'transparent'
		}
	};
};

export class TimelineStream extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpenBlockHash: false,
			blockHash: {}
		};
	}

	handleDialogOpenBlockHash = rowValue => {
		const { blockList } = this.props;
		const data = find(blockList, item => item.blockhash === rowValue);
		this.setState({
			dialogOpenBlockHash: true,
			blockHash: data
		});
	};

	handleDialogCloseBlockHash = () => {
		this.setState({ dialogOpenBlockHash: false });
	};

	render() {
		const { notifications, classes, button } = this.props;
		const { blockHash, dialogOpenBlockHash } = this.state;

		return (
			<>
				<div className={classes.card}>
					<div className={classes.title}>
						<Typography variant="h6">BLOCKS</Typography>
						{button}
					</div>
					<Divider />
					<Timeline lineColor="rgba(189, 189, 189, 1)" lineStyle={{ width: '1px' }}>
						{notifications.map(item => (
							<TimelineItem key={item.title} item={item} />
						))}
					</Timeline>
				</div>
				<Dialog
					open={dialogOpenBlockHash}
					onClose={this.handleDialogCloseBlockHash}
					fullWidth
					maxWidth="md"
				>
					<BlockView
						blockHash={blockHash}
						onClose={this.handleDialogCloseBlockHash}
					/>
				</Dialog>
			</>
		);
	}
}

TimelineStream.propTypes = {
	blockList: blockListType.isRequired,
	notifications: notificationsType.isRequired
};

export default withStyles(styles)(TimelineStream);
