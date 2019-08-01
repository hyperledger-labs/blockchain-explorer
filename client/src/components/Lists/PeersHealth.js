/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from '../Styled/Table';
import { peerStatusType } from '../types';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

/* eslint-disable */

const styles = theme => ({
	table: {
		height: 335,
		overflowY: 'scroll'
	},
});

/* eslint-enable */

const PeersHealth = ({ peerStatus, classes }) => {
	const columnHeaders = [
		{
			Header: 'Peer Name',
			accessor: 'server_hostname',
			filterAll: false,
		} /*
    {
      Header: 'Status',
      accessor: 'status',
      filterAll: false,
      className: classes.center,
      Cell: row => (
        <Badge color="success">
          {row.value}
        </Badge>
      ),
    },*/
	];
	return (
		<div>
			<ReactTable
				data={peerStatus}
				columns={columnHeaders}
				className={classes.table}
				minRows={0}
				showPagination={false}
			/>
		</div>
	);
};

PeersHealth.propTypes = {
	peerStatus: peerStatusType.isRequired
};

export default compose(
	withStyles(styles),
	graphql(
		gql`{
			list: peerList(count: 100) {
				items {
					server_hostname: address
				}
			}
		}`,
		{
			props({ data: { list } }) {
				return {
					peerStatus: list ? list.items : [],
				};
			},
		},
	),
)(PeersHealth);
