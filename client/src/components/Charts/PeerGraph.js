/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import {
    getBlocksPerMin as getBlocksPerMinCreator
} from '../../store/actions/charts/action-creators';
import { Graph } from 'react-d3-graph';
import { Card, CardHeader, CardBody } from 'reactstrap';
import 'react-tree-graph/dist/style.css';
class PeerGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                nodes: [
                    { id: 'peer0.org0.diid.network' },
                    { id: 'peer1.org0.diid.network' },
                    { id: 'peer0.org1.diid.network' },
                    { id: 'peer1.org1.diid.network' }
                ],
                links: [
                    {
                        source: 'peer0.org0.diid.network',
                        target: 'peer1.org0.diid.network'
                    }, {
                        source: 'peer0.org0.diid.network',
                        target: 'peer0.org1.diid.network'
                    }, {
                        source: 'peer0.org1.diid.network',
                        target: 'peer1.org1.diid.network'
                    }
                ]
            },
            myConfig: {
                height: 300,
                width: 600,
                maxZoom: 1.5,
                minZoom: 1.5,
                node: {
                    fontSize: 10,
                    fontWeight: "bold",
                    labelProperty: "id",
                    color: '#5bc5c2',
                    size: 200
                },
                links: {
                    "color": "#d3d3d3",
                    "strokeWidth": 1.5,
                }
            }

        }
    }
    componentDidMount() {
        // var nodes = [];
        // var links = [];
        // for (var i = 0; i < this.props.peerList.length; i++) {
        //     nodes[i] = { id: this.props.peerList[i].server_hostname };
        //     if (i < (this.props.peerList.length - 1)) {
        //         links[i] = {
        //             source: this.props.peerList[i].server_hostname,
        //             target: this.props.peerList[i + 1].server_hostname
        //         };
        //     }
        //     else {
        //         links[i] = {
        //             source: this.props.peerList[i].server_hostname,
        //             target: this.props.peerList[0].server_hostname
        //         };
        //     }
        // }
        // this.setState({
        //     data: {
        //         nodes: nodes,
        //         links: links
        //     }
        // });

    }
    render() {
        return (
            <div className="peer-graph">
                <Card>
                    <CardHeader>
                        <h5>PeerGraph</h5>
                    </CardHeader>
                    <CardBody>
                        <Graph id="graph-id"
                            data={this.state.data}
                            config={this.state.myConfig} />
                    </CardBody>
                </Card>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    getBlocksPerMin: () => dispatch(getBlocksPerMinCreator()),
});
const mapStateToProps = state => ({
    peerList: state.peerList.peerList,
    channel: state.channel.channel
});
export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(PeerGraph);
