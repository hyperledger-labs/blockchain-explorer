/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Table, Container, Row, Col } from 'reactstrap';
import Pagination from "react-js-pagination";

class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            limitrows: 10,
            totalBlocks: this.props.countHeader.txCount,
            activePage: 1,
            currentOffset: 0
        }
        this.handlePageChange = this.handlePageChange.bind(this);
        this.convertTime = this.convertTime.bind(this);
    }
    convertTime(date) {
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
    handlePageChange(pageNumber) {
        var newOffset = (pageNumber - 1) * this.state.limitrows;
        this.setState({ activePage: pageNumber, currentOffset: newOffset });
        this.props.getTransactionList(this.props.channel.currentChannel,newOffset);
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
                                        <th>Tx Id</th>
                                        <th>Creator</th>
                                        <th>Channel </th>
                                        <th>Type</th>
                                        <th>Payload</th>
                                        <th>Chaincode</th>
                                        <th>Timestamp</th>
                                        <th>Read</th>
                                        <th>Write</th>
                                    </thead>
                                    <tbody>
                                        {this.props.transactionList.map(tx =>
                                            <tr key={tx.id} >
                                                <td> <p className="hash-hide" >{tx.txhash}</p> </td>
                                                <td> </td>
                                                <td>{tx.channelname} </td>
                                                <td>  </td>
                                                <td>  </td>
                                                <td>{tx.chaincodename} </td>
                                                <td>{this.convertTime(tx.createdt)} </td>
                                                <td>  </td>
                                                <td>  </td>
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
            </div>
        );
    }
};

export default Transactions;