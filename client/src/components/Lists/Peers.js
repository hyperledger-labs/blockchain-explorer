/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import matchSorter from 'match-sorter';
import ReactTable from '../Styled/Table';
import { peerListType } from '../types';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

/* istanbul ignore next */
const Peers = ({ peerList }) => {
	const columnHeaders = [
		{
			Header: 'Peer Name',
			accessor: 'server_hostname',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['server_hostname'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Request Url',
			accessor: 'requests',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['requests'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Peer Type',
			accessor: 'peer_type',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['peer_type'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'MSPID',
			accessor: 'mspid',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['mspid'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Ledger Height',
			columns: [
				{
					Header: 'High',
					accessor: 'ledger_height_high',
					filterMethod: (filter, rows) =>
						matchSorter(
							rows,
							filter.value,
							{ keys: ['ledger_height_high'] },
							{ threshold: matchSorter.rankings.SIMPLEMATCH }
						),
					filterAll: true
				},
				{
					Header: 'Low',
					accessor: 'ledger_height_low',
					filterMethod: (filter, rows) =>
						matchSorter(
							rows,
							filter.value,
							{ keys: ['ledger_height_low'] },
							{ threshold: matchSorter.rankings.SIMPLEMATCH }
						),
					filterAll: true
				},
				{
					Header: 'Unsigned',
					id: 'ledger_height_unsigned',
					accessor: d => d.ledger_height_unsigned.toString(),
					filterMethod: (filter, rows) =>
						matchSorter(
							rows,
							filter.value,
							{ keys: ['ledger_height_unsigned'] },
							{ threshold: matchSorter.rankings.SIMPLEMATCH }
						),
					filterAll: true
				}
			]
		}
	];

	return (
		<div>
			<ReactTable
				data={peerList}
				columns={columnHeaders}
				defaultPageSize={5}
				filterable
				minRows={0}
				showPagination={!(peerList.length < 5)}
			/>
		</div>
	);
};

Peers.propTypes = {
	peerList: peerListType.isRequired
};

export default compose(
	graphql(
		gql`{
			list: peerList(count: 100) {
				items {
					address
					publicKey
				}
			}
			blockCount
		}`,
		{
			props({ data: { list, blockCount } }) {
				return {
					peerList: list ? list.items.map(({ address, publicKey }) => ({
						server_hostname: address,
						requests: address,
						peer_type: 'PEER',
						mspid: publicKey,
						ledger_height_high: 0,
						ledger_height_low: blockCount,
						ledger_height_unsigned: true,
					})) : [],
				};
			},
		},
	),
)(Peers);
