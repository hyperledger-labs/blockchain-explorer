/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Container, Row, Col, Tooltip } from 'reactstrap';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TransactionView from '../View/TransactionView';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Blocks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toolTipOpen: false,
            toolTipOpen2: false,
            dialogOpen: false,
            loading: false,
            totalBlocks: this.props.countHeader.latestBlock
        }
        this.toggle1 = this.toggle1.bind(this);
        this.toggle2 = this.toggle2.bind(this);
        this.handleDialogOpen = this.handleDialogOpen.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
    }

    toggle1() {
        this.setState({
            toolTipOpen1: !this.state.toolTipOpen1
        });
    }

    toggle2() {
        // console.log("changed toggle",num);
        this.setState({
            toolTipOpen2: !this.state.toolTipOpen2
        });
    }

    handleDialogOpen(tid) {
        this.props.getTransactionInfo(this.props.channel.currentChannel, tid);
        this.setState({ dialogOpen: true });
    }

    handleDialogClose() {
        this.setState({ dialogOpen: false });
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({ totalBlocks: this.props.countHeader.latestBlock });
    }

    componentDidMount() {
        setInterval(() => {
            this.props.getBlockList(this.props.channel.currentChannel, this.state.currentOffset);
        }, 60000)
    }

    componentDidUpdate(prevProps, prevState) {
    }

    render() {

        const columnHeaders = [
            {
              Header: "Block Number",
              accessor: "blocknum",
              filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["blocknum"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
              filterAll: true,
              width: 150
            },
            {
              Header: "Number of Tx",
              accessor: "txcount",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["txcount"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true,
            width: 150
            },
            {
              Header: "Data",
              accessor: "datahash",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["datahash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true
            },
            {
              Header: "Previous Hash",
              accessor: "prehash",
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["prehash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
            filterAll: true,
            width: 150
            },
            {
              Header: "Transactions",
              accessor: "txhash",
              Cell: row => (
               <ul>
                    {row.value.map( tid =>
                        <li style={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                             <a className="hash-hide"  onClick={() => this.handleDialogOpen(tid)} href="#" >{tid}</a>
                        </li>
                    )}
               </ul>
              ),
              filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["txhash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
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
                                    data={this.props.blockList}
                                    columns={columnHeaders}
                                    defaultPageSize={10}
                                    className="-striped -highlight"
                                    filterable
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
                <Dialog open={this.state.dialogOpen}
                    onClose={this.handleDialogClose}
                    fullWidth={true}
                    maxWidth={'md'}>
                    <TransactionView transaction={this.props.transaction} />
                </Dialog>
            </div >
        );
    }
};

export default Blocks;
