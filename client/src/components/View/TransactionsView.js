/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Transactions from '../Lists/Transactions';
import {
  currentChannelType,
  getTransactionType,
  getTransactionInfoType,
  getTransactionListType,
  transactionType,
  transactionListType
} from '../types';

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 42,
    position: 'relative'
  },
  card: {
    height: 250,
    minWidth: 1290,
    margin: 20,
    textAlign: 'left',
    display: 'inline-block'
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

export const TransactionsView = ({
  currentChannel,
  getTransaction,
  getTransactionInfo,
  getTransactionList,
  transaction,
  transactionList,
  getTransactionListSearch,
  transactionByOrg,
  transactionListSearch
}) => (
  <div className="view-fullwidth">
    <div className="view-display">
      <Card className="table-card">
        <Transactions
          currentChannel={currentChannel}
          transactionList={transactionList}
          getTransactionList={getTransactionList}
          transaction={transaction}
          transactionByOrg={transactionByOrg}
          getTransactionInfo={getTransactionInfo}
          getTransaction={getTransaction}
          getTransactionListSearch={getTransactionListSearch}
          transactionListSearch={transactionListSearch}
        />
      </Card>
    </div>
  </div>
);

TransactionsView.propTypes = {
  currentChannel: currentChannelType.isRequired,
  getTransaction: getTransactionType.isRequired,
  getTransactionInfo: getTransactionInfoType.isRequired,
  getTransactionList: getTransactionListType.isRequired,
  transaction: transactionType.isRequired,
  transactionList: transactionListType.isRequired
};

export default compose(withStyles(styles))(TransactionsView);
