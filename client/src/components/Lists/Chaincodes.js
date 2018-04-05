import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Table, Container, Row, Col, Tooltip } from 'reactstrap';
import Pagination from "react-js-pagination";
import { getChaincodes as getChaincodesCreator } from '../../store/actions/chaincodes/action-creators';

class Chaincodes extends Component {
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
        // this.handlePageChange = this.handlePageChange.bind(this);

    }
    // handlePageChange(pageNumber) {
    //     var newOffset = (pageNumber - 1) * this.state.limitrows;
    //     this.setState({ activePage: pageNumber, currentOffset: newOffset });
    //     this.props.getChaincodes(this.props.channel.currentChannel,newOffset);
    // }
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
                                            <th>Chaincode Name</th>
                                            <th>Channel Name</th>
                                            <th>Path</th>
                                            <th>Transaction Count</th>
                                            <th>Version</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.props.chaincodes.map((chaincode, index)  =>
                                            <tr key={chaincode.chaincodename + index}>
                                                <td>  {chaincode.chaincodename} </td>
                                                <td>{chaincode.channelName} </td>
                                                <td>{chaincode.path}</td>
                                                <td>{chaincode.txCount}</td>
                                                <td>{chaincode.version}</td>
                                            </tr>)}
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12" md={{ size: 8, offset: 6 }}>
                            {/* <Pagination
                                activePage={this.state.activePage}
                                itemsCountPerPage={this.state.limitrows}
                                totalItemsCount={this.state.totalBlocks}
                                pageRangeDisplayed={5}
                                onChange={this.handlePageChange} /> */}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
};
const mapDispatchToProps = (dispatch) => ({
    getChaincodes: (channel,offset) => dispatch(getChaincodesCreator(channel,offset)),
});
const mapStateToProps = state => ({
    chaincodes: state.chaincodes.chaincodes,
    countHeader: state.countHeader.countHeader,
    channel : state.channel.channel
});
// export default Blocks;
export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(Chaincodes);
