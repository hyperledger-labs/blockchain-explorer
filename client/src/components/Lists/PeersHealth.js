/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Badge } from 'reactstrap';
import ReactTable from 'react-table';
import { peerStatusType } from '../types';
import 'react-table/react-table.css';

const PeersHealth = ({ peerStatus }) => {
  const columnHeaders = [
    {
      Header: 'Peer Name',
      accessor: 'server_hostname',
      filterAll: false,
      className: 'center-column'
    },
    {
      Header: 'Status',
      accessor: 'status',
      filterAll: false,
      className: 'center-column',
      Cell: row => <Badge color="success">{row.value}</Badge>
    }
  ];

  return (
    <div>
      <ReactTable
        data={peerStatus}
        columns={columnHeaders}
        className="-striped -highlight peers-health"
        minRows={0}
        showPagination={false}
      />
    </div>
  );
};

PeersHealth.propTypes = {
  peerStatus: peerStatusType.isRequired
};

export default PeersHealth;
