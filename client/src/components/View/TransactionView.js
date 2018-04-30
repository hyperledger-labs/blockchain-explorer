/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Typography from 'material-ui/Typography';
import {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import moment from 'moment-timezone';

const styles = theme => ({
    root: {
        flexGrow: 1,
        paddingTop: 42,
        position: 'relative',
    },
    card: {
        height: 250,
        width: 1215,
        margin: 20,
        textAlign: 'left',
        display: 'inline-block',
    },
    title: {
        fontSize: 16,
        color: theme.palette.text.secondary,
        position: 'absolute',
        left: 40,
        top: 60
    },
    content: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        position: 'absolute',
        left: 40,
        top: 70
    }
});

class TransactionView extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ loading: false });
    }
    render() {
        const { classes } = this.props;
        if (this.props.transaction.read_set === undefined) {
            return (
                <div>
                    <DialogTitle>Transaction Detail</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <p className="loading-wheel"> <FontAwesome name="circle-o-notch" size="3x" spin /></p>
                        </DialogContentText>
                    </DialogContent>
                </div>
            );
        }
        else {
            return (
                <div>
                    <DialogTitle>Transaction Detail</DialogTitle>
                    <DialogContent>
                        <DialogContentText>

                            <b>Tx:</b>{this.props.transaction.txhash} <br />
                            <b>Creator MSP:</b> {this.props.transaction.creator_msp_id} <br />
                            <b>Endorser:</b> {this.props.transaction.endorser_msp_id} <br />
                            <b>Chaincode Name:</b> {this.props.transaction.chaincodename} <br />
                            <b>Type:</b> {this.props.transaction.type} <br />
                            <b>Time:</b> {moment(this.props.transaction.createdt).tz(moment.tz.guess()).format("M-D-YYYY h:mm A zz")} <br />
                            <b>Reads:</b>
                             <ul>
                                {this.props.transaction.read_set.map(function (item) {

                                    return item === null ? '' :
                                        <li><Typography variant="subheading"> {item.chaincode}</Typography>
                                            <ul>{item.set.map(function (x) {
                                                var block_num = '';
                                                var tx_num = '';
                                                if (x.version !== null) {
                                                    block_num = x.version.block_num;
                                                    tx_num = x.version.tx_num;
                                                }
                                                return x === null ? '' : <li>key:{x.key} ,version:( block:{block_num},tx:{tx_num})  </li>
                                            })}</ul>
                                            <br />
                                        </li>;
                                })}
                            </ul>
                            <b>Writes:</b>
                            <ul>
                                {this.props.transaction.write_set.map(function (item) {

                                    return item === null ? '' :
                                        <li><Typography variant="subheading"> {item.chaincode}</Typography>
                                            <ul>{item.set.map(function (x) {
                                                return x === null ? '' : <li>key:{x.key} ,is_delete:{x.is_delete.toString()},value:{x.value}  </li>
                                            })}</ul>
                                            <br />
                                        </li>;
                                })}
                            </ul>
                        </DialogContentText>
                    </DialogContent>
                </div>

            );
        }
    }
}


TransactionView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransactionView);
