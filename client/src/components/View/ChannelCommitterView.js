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
		colHe: {
			fontWeight: 'bold',
			color: dark ? 'white' : 'black'
		},
		bodyCon: {
			maxHeight: '550px',
			overflowY: 'auto',
			display: 'flex',
			justifyContent: 'space-between'
		},
		tableWrap: {
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

export class ChannelCommitterView extends Component {
	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	renCol = (committers, starti, endi) => {
		const col = [];
		for (let i = starti; i < endi; i++) {
			col.push(
				<tr key={i}>
					<td className={this.props.classes.text}>{i + 1}</td>
					<td className={this.props.classes.text}>{committers[i]}</td>
				</tr>
			);
		}
		return col;
	};

	render() {
		const { channelPeerData, classes } = this.props;
		if (channelPeerData) {
			const { committers } = channelPeerData;
			const noCol = Math.ceil(committers.length / 10);
			const col = [];
			for (let i = 0; i < noCol; i++) {
				const starti = i * 10;
				const endi = Math.min((i + 1) * 10, committers.length);
				col.push(
					<div key={i} className={classes.tableWrap}>
						<Table
							striped
							hover
							responsive
							className="table-striped"
							style={{ width: '100%' }}
						>
							<tbody>
								<tr>
									<th className={classes.colHe}>ID</th>
									<th className={classes.colHe}>Committers List</th>
								</tr>
								{this.renCol(committers, starti, endi)}
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
									Channel Committers List
									<button
										type="button"
										onClick={this.handleClose}
										className={modalClasses.closeBtn}
									>
										<FontAwesome name="close" />
									</button>
								</CardTitle>
								<CardBody
									className={`${modalClasses.body} ${classes.bodyCon} ${classes.scroll}`}
								>
									{col}
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
							Channel Committers List
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

ChannelCommitterView.propTypes = {
	channelPeerData: channelPeerDataType.isRequired,
	onClose: onCloseType.isRequired
};
ChannelCommitterView.defaultProps = {
	channelPeerData: null
};

export default withStyles(styles)(ChannelCommitterView);
