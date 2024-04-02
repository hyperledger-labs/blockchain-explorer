/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import matchSorter from 'match-sorter';
import ReactTable from '../Styled/Table';
import { channelPeerDataType, channelsType } from '../types';
import ChannelEndorserView from '../View/ChannelEndorserView';
import ChannelCommitterView from '../View/ChannelCommitterView';
import Dialog from '@material-ui/core/Dialog';
import { E006, E007, E008 } from './constants';
import { Info } from '@material-ui/icons';
import moment from 'moment';
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		partialHash: {
			textAlign: 'center',
			position: 'relative !important',
			'&:hover $fullHash': {
				display: 'block',
				position: 'absolute !important',
				padding: '4px 4px',
				backgroundColor: dark ? '#5e558e' : '#000000',
				marginTop: -30,
				marginLeft: -215,
				borderRadius: 8,
				color: '#ffffff',
				opacity: dark ? 1 : undefined
			},
			'&:hover $lastFullHash': {
				display: 'block',
				position: 'absolute !important',
				padding: '4px 4px',
				backgroundColor: dark ? '#5e558e' : '#000000',
				marginTop: -30,
				marginLeft: -415,
				borderRadius: 8,
				color: '#ffffff',
				opacity: dark ? 1 : undefined
			}
		}
	};
};
class Channels extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
			dialogOpenEndorser: false,
			sourceDialog: false
		};
	}

	handleDialogOpenCommitter = async currentChannel => {
		await this.props.getChannelPeerData(currentChannel);
		this.setState({ dialogOpen: true });
	};

	handleDialogOpen = async currentChannel => {
		await this.props.getChannelPeerData(currentChannel);
		this.setState({ dialogOpenEndorser: true });
	};
	handleDialogCloseCommitter = () => {
		this.setState({ dialogOpen: false });
	};
	handleDialogClose = () => {
		this.setState({ dialogOpenEndorser: false });
	};

	reactTableSetup = classes => [
		{
			Header: 'ID',
			accessor: 'id',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['id'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 100
		},
		{
			Header: 'Channel Name',
			accessor: 'channelname',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['channelname'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: (
				<span>
					Total Blocks
					<sup title={E006} style={{ padding: '3px' }}>
						<Info style={{ fontSize: 'medium', marginTop: '5px' }} />
					</sup>
				</span>
			),
			accessor: 'totalBlocks',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['totalBlocks'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: (
				<span>
					Blocks
					<sup title={E007} style={{ padding: '3px' }}>
						<Info style={{ fontSize: 'medium', marginTop: '5px' }} />
					</sup>
				</span>
			),
			accessor: 'blocks',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['blocks'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 125
		},
		{
			Header: (
				<span>
					Transactions
					<sup title={E008} style={{ padding: '3px' }}>
						<Info style={{ fontSize: 'medium', marginTop: '5px' }} />
					</sup>
				</span>
			),
			accessor: 'transactions',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['transactions'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 125
		},
		{
			Header: <span>Committers</span>,
			accessor: 'channel_members.committers',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['channel_members.committers'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			Cell: ({ value }) => {
				const cts = value.slice(0, 5);
				const rcc = value.length - cts.length;

				return (
					<span>
						{cts.map((committer, i) => (
							<>
								{value.length > 1 && `${i + 1}. `}
								{i > 0 && ' '}
								{committer}
								<br />
							</>
						))}
						{rcc > 0 && (
							<span>
								<br />
								<a
									data-command="committer"
									onClick={() =>
										this.handleDialogOpenCommitter(this.props.currentChannel, rcc)
									}
									className={classes.partialHash}
									href="#/channels"
								>
									See All
								</a>
							</span>
						)}
					</span>
				);
			}
		},
		{
			Header: <span>Endorsers</span>,
			accessor: 'channel_members.endorsers',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['channel_members.endorsers'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			Cell: ({ value }) => {
				const etc = value.slice(0, 5);
				const rec = value.length - etc.length;

				return (
					<span>
						{etc.map((endorser, i) => (
							<>
								{i > 0 && ' '}
								{i + 1}. {endorser}
								<br />
							</>
						))}
						{rec > 0 && (
							<span>
								<br />
								<a
									data-command="endorsers"
									onClick={() => this.handleDialogOpen(this.props.currentChannel, rec)}
									className={classes.partialHash}
									href="#/channels"
								>
									See All
								</a>
							</span>
						)}
					</span>
				);
			}
		},
		{
			Header: 'Timestamp',
			accessor: 'createdat',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['createdat'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			Cell: ({ value }) => moment.utc(value).format('YYYY-MM-DD, HH:mm:ss UTC')
		}
	];

	render() {
		const { channels, channelPeerData, classes } = this.props;
		const { dialogOpen, dialogOpenEndorser } = this.state;
		return (
			<div>
				<ReactTable
					data={channels}
					columns={this.reactTableSetup(classes)}
					defaultPageSize={5}
					filterable
					minRows={0}
					showPagination={channels.length >= 5}
				/>
				<Dialog
					open={dialogOpenEndorser}
					onClose={this.handleDialogClose}
					fullWidth
					maxWidth="md"
				>
					<ChannelEndorserView
						channelPeerData={channelPeerData}
						onClose={this.handleDialogClose}
					/>
				</Dialog>

				<Dialog
					open={dialogOpen}
					onClose={this.handleDialogCloseCommitter}
					fullWidth
					maxWidth="md"
				>
					<ChannelCommitterView
						channelPeerData={channelPeerData}
						onClose={this.handleDialogCloseCommitter}
					/>
				</Dialog>
			</div>
		);
	}
}

Channels.propTypes = {
	channels: channelsType.isRequired,
	channelPeerData: channelPeerDataType
};
Channels.defaultProps = {
	channelPeerData: null
};
export default withStyles(styles)(Channels);
