/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Blocks from '../Lists/Blocks';
import {
    getBlockList,
    getChannelSelector,
    getCountHeader,
    getTransaction,
    getTransactionList,
} from '../../store/selectors/selectors';
import { blockList } from '../../store/actions/block/action-creators';
import { countHeader } from '../../store/actions/header/action-creators';
import { latestBlock } from '../../store/actions/latestBlock/action-creators';
import { transactionInfo } from '../../store/actions/transaction/action-creators';
import { transactionList } from '../../store/actions/transactions/action-creators';

const styles = theme => ({
    root: {
        flexGrow: 1,
        paddingTop: 42,
        position: 'relative',
    },
    card: {
        height: 250,
        minWidth: 1290,
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

export class BlocksView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeView: 'Network',
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
            this.syncData(nextProps.channel.currentChannel)
        }
    }

    syncData = (currentChannel) => {
        this.props.getCountHeader(currentChannel);
        this.props.getLatestBlock(currentChannel);
        this.props.getBlockList(currentChannel);
    }

    render() {
        const { classes } = this.props;
        return (
            <div className="view-fullwidth" >
                <div className="view-display">
                    <Blocks blockList={this.props.blockList}
                        channel={this.props.channel}
                        countHeader={this.props.countHeader}
                        getBlockList={this.props.getBlockList}
                        transaction={this.props.transaction}
                        getTransactionInfo={this.props.getTransactionInfo} />
                </div>
            </div>
        );
    }
}


BlocksView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default compose(withStyles(styles), connect((state) => ({
    blockList: getBlockList(state),
    channel: getChannelSelector(state),
    countHeader: getCountHeader(state),
    transaction: getTransaction(state),
    transactionList: getTransactionList(state)
}),
    {
        getBlockList: blockList,
        getCountHeader: countHeader,
        getLatestBlock: latestBlock,
        getTransactionInfo: transactionInfo,
        getTransactionList: transactionList

    }))(BlocksView);