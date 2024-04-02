/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { channelPeerDataType, onCloseType } from '../types';
import Modal from '../Styled/Modal';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		listIcon: {
			color: '#ffffff',
			marginRight: 20
		},
		colHead: {
			fontWeight: 'bold',
			color: dark ? 'white' : 'black'
		},
		bodyContains: {
			maxHeight: '550px',
			overflowY: 'auto',
			display: 'flex',
			justifyContent: 'space-between'
		},
		tbleWraps: {
			flex: '1',
			margin: '0 10px'
		},
		text: {
			color: dark ? 'white' : 'black'
		},
		scroll: {
			zIndex: 1,
			maxHeight: 600,
			overflowY: 'auto',
			borderRadius: '2px',
			'&::-webkit-scrollbar:horizontal': {
				height: '4px'
			},
			'&::-webkit-scrollbar-thumb:horizontal': {
				background: theme.palette.type === 'dark' ? 'gray' : 'lightgray',
				borderRadius: '4px'
			}
		}
	};
};

export class ChannelEndorserView extends Component {
	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	rendCol = (endorsers, starti, endi) => {
		const cols = [];
		for (let i = starti; i < endi; i++) {
			cols.push(
				<tr key={i}>
					<td className={this.props.classes.text}>{i + 1}</td>
					<td className={this.props.classes.text}>{endorsers[i]}</td>
				</tr>
			);
		}
		return cols;
	};

	render() {
		const { channelPeerData, classes } = this.props;
		if (channelPeerData) {
			const { endorsers } = channelPeerData;
			const nocol = Math.ceil(endorsers.length / 10);
			const cols = [];
			for (let i = 0; i < nocol; i++) {
				const starti = i * 10;
				const endi = Math.min((i + 1) * 10, endorsers.length);
				cols.push(
					<div key={i} className={classes.tbleWraps}>
						<Table
							striped
							hover
							responsive
							className="table-striped"
							style={{ width: '100%' }}
						>
							<tbody>
								<tr>
									<th className={classes.colHead}>ID</th>
									<th className={classes.colHead}>Peers List</th>
								</tr>
								{this.rendCol(endorsers, starti, endi)}
							</tbody>
						</Table>
					</div>
				);
			}

			return (
				<Modal>
					{modalClasses => (
						<div className={modalClasses.dialog}>
							<Card className={modalClasses.card}>
								<CardTitle className={modalClasses.title}>
									<FontAwesome name="list-alt" className={classes.listIcon} />
									Channel Peers List
									<button
										type="button"
										onClick={this.handleClose}
										className={modalClasses.closeBtn}
									>
										<FontAwesome name="close" />
									</button>
								</CardTitle>
								<CardBody
									className={`${modalClasses.body} ${classes.bodyContains} ${classes.scroll}`}
								>
									{cols}
								</CardBody>
							</Card>
						</div>
					)}
				</Modal>
			);
		}
		return (
			<Modal>
				{modalClasses => (
					<Card className={modalClasses.card}>
						<CardTitle className={modalClasses.title}>
							<FontAwesome name="cube" />
							Channel Peers List
						</CardTitle>
						<CardBody className={modalClasses.body}>
							<span>
								{' '}
								<FontAwesome name="circle-o-notch" size="3x" spin />
							</span>
						</CardBody>
					</Card>
				)}
			</Modal>
		);
	}
}

ChannelEndorserView.propTypes = {
	channelPeerData: channelPeerDataType.isRequired,
	onClose: onCloseType.isRequired
};

ChannelEndorserView.defaultProps = {
	channelPeerData: null
};

export default withStyles(styles)(ChannelEndorserView);
