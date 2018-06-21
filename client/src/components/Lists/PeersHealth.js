/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Button, Row, Col, Card, CardHeader, CardBody, Badge } from 'reactstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { get } from '../../services/request.js';

export default class PeersHealth extends Component {

    constructor(props) {
        super(props);
        console.log(JSON.stringify(props));
        this.state = { peerStatus: props.peerStatus };
    }
    refreshStatus() {
        console.log(this.props.channel);
        get('/api/peersStatus/' + this.props.channel)
            .then(resp => {
                this.setState({ peerStatus: resp.peers })
            }).catch((error) => {
                console.error(error);
            })

    }

    render() {
        const columnHeaders = [
            {
                Header: "Peer Name",
                accessor: "server_hostname",
                filterAll: false
            },
            {
                Header: "Status",
                accessor: "status",
                filterAll: false,
                Cell: row => (
                    <Badge  color="success">{row.value}</Badge>
                )
            }
        ];

        return (
            <div /* className="peer-graph" */>
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


