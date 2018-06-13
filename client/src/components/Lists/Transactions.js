/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TransactionView from '../View/TransactionView';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      totalTransactions: this.props.countHeader.txCount,
      dialogOpen: false
    };
  }

  handleDialogOpen = tid => {
    this.props.getTransactionInfo(this.props.channel.currentChannel, tid);
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ totalTransactions: this.props.countHeader.txCount });
  }

  render() {
    const columnHeaders = [
      {
        Header: "Creator",
        accessor: "creator_msp_id",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["creator_msp_id"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
        filterAll: true
      },
      {
        Header: "Tx Id",
        accessor: "txhash",
        Cell: row => (
          <a onClick={() => this.handleDialogOpen(row.value)} href="#/transactions" >{row.value}</a>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["txhash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
        filterAll: true
      },
      {
        Header: "Type",
        accessor: "type",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["type"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
        filterAll: true
      },
      {
        Header: "Chaincode",
        accessor: "chaincodename",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["chaincodename"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
        filterAll: true
      },
      {
        Header: "Timestamp",
        accessor: "createdt",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["createdt"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
        filterAll: true
      }
    ];

    return (
      <div>
        <ReactTable
          data={this.props.transactionList}
          columns={columnHeaders}
          defaultPageSize={10}
          className="-striped -highlight"
          filterable
          minRows={0}/>

        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <TransactionView transaction={this.props.transaction} />
        </Dialog>
      </div>
    );
  }
};

export default Transactions;
