/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactTable from '../Styled/Table';
import matchSorter from 'match-sorter';
import { peerListType } from '../types';

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

export default Peers;
