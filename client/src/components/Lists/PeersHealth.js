/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class PeersHealth extends Component {
  constructor(props) {
    super(props);
    this.state = { peerStatus: props.peerStatus };
  }



  render() {
    const columnHeaders = [
      {
        Header: 'Peer Name',
        accessor: 'server_hostname',
        filterAll: false
      },
      {
        Header: 'Status',
        accessor: 'status',
        filterAll: false,
        Cell: row => <Badge color="success">{row.value}</Badge>
      }
    ];

    return (
      <div>
        <ReactTable
          data={this.state.peerStatus}
          columns={columnHeaders}
          className="-striped -highlight peers-health"
          minRows={0}
          showPagination={false}
        />
      </div>
    );
  }
}

export default PeersHealth
