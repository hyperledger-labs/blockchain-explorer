/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

const Peers = ({ peerList }) => {
    const columnHeaders = [
        {
            Header: "Peer Name",
            accessor: "server_hostname",
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["server_hostname"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
        },
        {
            Header: "Request Url",
            accessor: "requests",
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["requests"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
        },
        {
            Header: "Peer Type",
            accessor: "peer_type",
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["peer_type"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
        }
        ,
        {
            Header: "MSPID",
            accessor: "mspid",
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["mspid"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
        }
    ];

    return (
        <div>
            <ReactTable
                data={peerList}
                columns={columnHeaders}
                defaultPageSize={5}
                className="-striped -highlight"
                filterable
                minRows={0}
                showPagination={peerList.length < 5  ?  false : true }

            />
        </div>
    );
};

export default Peers;
