/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Table, Container, Row, Col } from 'reactstrap';
import Pagination from "react-js-pagination";
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TransactionView from '../View/TransactionView';

class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            limitrows: 10,
            totalBlocks: this.props.countHeader.txCount,
            activePage: 1,
            currentOffset: 0,
            dialogOpen: false
        }
    }
    convertTime = (date) => {
        var hold = new Date(date);
        var hours = hold.getHours();
        var minutes = hold.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }
    handlePageChange = (pageNumber) => {
        var newOffset = (pageNumber - 1) * this.state.limitrows;
        this.setState({ activePage: pageNumber, currentOffset: newOffset });
        this.props.getTransactionList(this.props.channel.currentChannel,newOffset);
    }

    handleDialogOpen = (tid) => {
        this.props.getTransactionInfo(this.props.channel.currentChannel, tid);
        this.setState({ dialogOpen: true });
    }
    handleDialogClose = () => {
        this.setState({ dialogOpen: false });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ totalBlocks: this.props.countHeader.txCount });
    }
    componentDidMount() {

    }
    render() {
        return (
            <div>
                <Container>
                    <Row>
                        <Col>
                            <div className="scrollTable" >
                                <Table>
                                    <thead>
                                        <th>Creator</th>
                                        <th>Channel </th>
                                        <th>Tx Id</th>
                                        <th>Type</th>
                                        <th>Chaincode</th>
                                        <th>Timestamp</th>
                                    </thead>
                                    <tbody>
                                        {this.props.transactionList.map(tx =>
                                            <tr key={tx.id}>
                                                <td>{tx.creator_msp_id} </td>
                                                <td>{tx.channelname} </td>
                                                <td><a onClick={() => this.handleDialogOpen(tx.txhash)} href="#" >{tx.txhash}</a></td>
                                                <td>{tx.type}</td>
                                                <td>{tx.chaincodename} </td>
                                                <td>{this.convertTime(tx.createdt)} </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </Table>
                            </div >
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12" md={{ size: 8, offset: 6 }}>
                            <Pagination
                                activePage={this.state.activePage}
                                itemsCountPerPage={this.state.limitrows}
                                totalItemsCount={this.state.totalBlocks}
                                pageRangeDisplayed={5}
                                onChange={this.handlePageChange} />
                        </Col>
                    </Row>
                </Container>
                <Dialog open={this.state.dialogOpen}
                    onClose={this.handleDialogClose}
                    fullWidth={true}
                    maxWidth={'md'}>
                    <TransactionView transaction={this.props.transaction} />
                </Dialog>
            </div>
        );
    }
};

export default Transactions;