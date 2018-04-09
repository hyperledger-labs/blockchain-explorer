/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Table, Container, Row, Col, Tooltip } from 'reactstrap';
import Pagination from "react-js-pagination";
import { getBlockList as getBlockListCreator } from '../../store/actions/block/action-creators';

class Blocks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toolTipOpen: false,
            toolTipOpen2: false,
            loading: false,
            limitrows: 10,
            totalBlocks: this.props.countHeader.latestBlock,
            activePage: 1,
            currentOffset: 0
        }
        this.toggle1 = this.toggle1.bind(this);
        this.toggle2 = this.toggle2.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);

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
    handlePageChange(pageNumber) {
        var newOffset = (pageNumber - 1) * this.state.limitrows;
        this.setState({ activePage: pageNumber, currentOffset: newOffset });
        this.props.getBlockList(this.props.channel.currentChannel,newOffset);
    }
    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({ totalBlocks: this.props.countHeader.latestBlock });
    }


    componentDidMount() {
        setInterval(() => {
            this.props.getBlockList(this.props.channel.currentChannel,this.state.currentOffset);
        }, 60000)
    }

    componentDidUpdate(prevProps, prevState) {
    }
    // var state = { toolTipOpen1: false }
    render() {
        return (
            <div className="blockPage">
                <Container>
                    <Row>
                        <Col >
                            <div className="scrollTable" >
                                <Table id="blockList">
                                    <thead className='fixed-header'>
                                        <tr>
                                            <th>Block Number</th>
                                            <th>Number of Tx</th>
                                            <th>Data</th>
                                            <th>Previous Hash</th>
                                            <th>Transactions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.props.blockList.map(block =>
                                            <tr key={block.blocknum}>
                                                <td>  {block.blocknum} </td>
                                                <td>{block.txcount} </td>
                                                <td><p className="hash-hide" id={'Tooltip-' + block.blocknum}>{block.datahash}</p>
                                                    <Tooltip placement="right" isOpen={this.state.toolTipOpen1} target={'Tooltip-' + block.blocknum} toggle={this.toggle1} >
                                                        {block.datahash}
                                                    </Tooltip>
                                                </td>
                                                <td><p className="hash-hide" id={'Tooltip2-' + block.blocknum}>{block.prehash}</p>
                                                    <Tooltip placement="right" isOpen={this.state.toolTipOpen2} target={'Tooltip2-' + block.blocknum} toggle={this.toggle2} >
                                                        {block.prehash}
                                                    </Tooltip>
                                                </td>
                                                <td>
                                                    <ul>
                                                        {block.txhash.map(tid =>
                                                            <li  >
                                                                <a href="#">  {tid}</a>
                                                            </li>)
                                                        }
                                                    </ul>
                                                </td>
                                            </tr>)}
                                    </tbody>
                                </Table>
                            </div>
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
const mapDispatchToProps = (dispatch) => ({
    getBlockList: (channel,offset) => dispatch(getBlockListCreator(channel,offset)),
});
const mapStateToProps = state => ({
    blockList: state.blockList.blockList,
    countHeader: state.countHeader.countHeader,
    channel : state.channel.channel
});
// export default Blocks;
export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(Blocks);
