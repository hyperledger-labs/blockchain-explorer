/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import matchSorter from 'match-sorter';
import ReactTable from '../Styled/Table';
import { channelsType } from '../types';
import {
	E006,
	E007,
	E008
} from './constants';
import { Info } from '@material-ui/icons';
import moment from 'moment';

class Channels extends Component {
	reactTableSetup = () => [
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
			Header: <span>
			Total Blocks
			<sup title={E006} style={{ padding: '3px' }}>
				<Info style={{ fontSize: 'medium',marginTop:'5px' }} />
			</sup>
		</span>,
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
			Header: <span>
			Blocks
			<sup title={E007} style={{ padding: '3px' }}>
				<Info style={{ fontSize: 'medium',marginTop:'5px' }} />
			</sup>
		</span>,
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
			Header: <span>
			Transactions
			<sup title={E008} style={{ padding: '3px' }}>
				<Info style={{ fontSize: 'medium',marginTop:'5px' }} />
			</sup>
		</span>,
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
			Cell: ({ value }) =>
			moment.utc(value).format('YYYY-MM-DD, HH:mm:ss UTC')
		}
	];

	render() {
		const { channels } = this.props;
		return (
			<div>
				<ReactTable
					data={channels}
					columns={this.reactTableSetup()}
					defaultPageSize={5}
					filterable
					minRows={0}
					showPagination={channels.length >= 5}
				/>
			</div>
		);
	}
}

Channels.propTypes = {
	channels: channelsType.isRequired
};

export default Channels;
