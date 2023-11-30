/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import matchSorter from 'match-sorter';
import Dialog from '@material-ui/core/Dialog';
import ReactTable from '../Styled/Table';
import { chaincodeListType } from '../types';
import ChaincodeMetaDataView from '../View/ChaincodeMetaDataView';
import {
	E009
} from './constants';
import { Info } from '@material-ui/icons';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		hash: {
			'&, & li, & ul': {
				overflow: 'visible !important'
			}
		},
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
		},
		fullHash: {
			display: 'none'
		}
	};
};

export class Chaincodes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
			sourceDialog: false,
			chaincode: {}
		};
	}

	handleDialogOpen = async (channelhash,tid) => {
		await this.props.getChaincodeMetaData(channelhash,tid);
		this.setState({ dialogOpen: true });
	};

	handleDialogClose = () => {
		this.setState({ dialogOpen: false });
	};

	reactTableSetup = classes => [
		{
			Header: 'Chaincode Name',
			accessor: 'chaincodename',
			className: classes.hash,
			Cell: row => (
				<span>
					<a
						data-command="transaction-partial-hash"
						className={classes.partialHash}
						onClick={() => this.handleDialogOpen(this.props.currentChannel,row.value)}
						href="#/chaincodes"
					>{row.value}
					</a>
				</span>
			),
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['chaincodename'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Channel Name',
			accessor: 'channelName',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['channelName'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Path',
			accessor: 'path',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['path'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: <span>
			Transaction Count
			<sup title={E009} style={{ padding: '3px' }}>
				<Info style={{ fontSize: 'medium',marginTop:'5px' }} />
			</sup>
		</span>,
			accessor: 'txCount',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['txCount'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Version',
			accessor: 'version',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['version'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		}
	];

	render() {
		const { chaincodeList, chaincodeMetaData, classes } = this.props;
		const { dialogOpen, sourceDialog, chaincode } = this.state;
		return (
			<div>
				<ReactTable
					data={chaincodeList}
					columns={this.reactTableSetup(classes)}
					defaultPageSize={5}
					filterable
					minRows={0}
					showPagination={chaincodeList?.length >= 5}
				/>
				<Dialog
					open={dialogOpen}
					onClose={this.handleDialogClose}
					fullWidth
					maxWidth="md"
				>
					<ChaincodeMetaDataView
						chaincodeMetaData={chaincodeMetaData}
						onClose={this.handleDialogClose}
					/>
				</Dialog>
			</div>
		);
	}
}

Chaincodes.propTypes = {
	chaincodeList: chaincodeListType.isRequired
};

export default withStyles(styles)(Chaincodes);
