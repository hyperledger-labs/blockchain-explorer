/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Chaincodes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toolTipOpen: false,
            toolTipOpen2: false,
            loading: false,
            chaincodeCount: this.props.countHeader.chaincodeCount,
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({ totalBlocks: this.props.countHeader.latestBlock });
    }

    componentDidMount() {
        setInterval(() => {
            this.props.getChaincodes(this.props.channel.currentChannel,this.state.currentOffset);
        }, 60000)
    }

    componentDidUpdate(prevProps, prevState) {
    }

    render() {

        const columnHeaders = [
            {
              Header: "Chaincode Name",
              accessor: "chaincodename",
              filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["chaincodename"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
              filterAll: true
            },
            {
              Header: "Channel Name",
              accessor: "channelName",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["channelName"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
            },
            {
              Header: "Path",
              accessor: "path",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["path"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
            },
            {
              Header: "Transaction Count",
              accessor: "txCount",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["txCount"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
            },
            {
              Header: "Version",
              accessor: "version",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["version"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
            }
          ];

        return (
            <div className="blockPage">
                <Container>
                    <Row>
                        <Col >
                            <div className="scrollTable" >
                            <ReactTable
                                data={this.props.chaincodes}
                                columns={columnHeaders}
                                defaultPageSize={5}
                                className="-striped -highlight"
                                filterable
                            />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
};

export default Chaincodes
