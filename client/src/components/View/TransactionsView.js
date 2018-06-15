/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Transactions from '../Lists/Transactions';

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

export class TransactionsView extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.syncData(nextProps.channel.currentChannel)
    }
  }

  syncData = (currentChannel) => {
    this.props.getCountHeader(currentChannel);
    this.props.getLatestBlock(currentChannel);
    this.props.getTransactionList(currentChannel, 0);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="view-fullwidth" >
        <div className="view-display">
          <Transactions channel={this.props.channel}
            countHeader={this.props.countHeader}
            transactionList={this.props.transactionList.rows}
            getTransactionList={this.props.getTransactionList}
            transaction={this.props.transaction}
            getTransactionInfo={this.props.getTransactionInfo} />
        </div>
      </div>
    );
  }
}

TransactionsView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles)
)(TransactionsView);
