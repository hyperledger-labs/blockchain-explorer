import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import ChartStats from '../Charts/ChartStats';
import PeerGraph from '../Charts/PeerGraph';
import TimelineStream from '../Lists/TimelineStream';
import OrgPieChart from '../Charts/OrgPieChart';
import { Card, Row, Col, CardBody } from 'reactstrap';
import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import FontAwesome from 'react-fontawesome';
class DashboardView extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="dashboard" >
                <div className="dash-stats">
                    <Row>
                        <Card className="count-card dark-card">
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.latestBlock}</h1>
                                <h4> <FontAwesome name="cube" /> Blocks</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card light-card" >
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.txCount}</h1>
                                <h4><FontAwesome name="list-alt" /> Transactions</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card dark-card" >
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.peerCount}</h1>
                                <h4><FontAwesome name="users" />Nodes</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card light-card" >
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.chaincodeCount}</h1>
                                <h4><FontAwesome name="handshake-o" />Chaincodes</h4>
                            </CardBody>
                        </Card>
                    </Row>
                </div>
                <Row>
                    <Col lg="6">
                        <ChartStats />
                    </Col>
                    <Col lg="6">
                        <OrgPieChart />
                    </Col>
                </Row>
                <Row className="lower-dash">
                    <Col lg="6">
                    <TimelineStream />
                    </Col>
                    <Col lg="6">
                        <PeerGraph />
                    </Col>
                </Row>
            </div >
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    getCountHeader: (curChannel) => dispatch(getCountHeaderCreator(curChannel)),
});
const mapStateToProps = state => ({
    countHeader: state.countHeader,
});
export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(DashboardView);