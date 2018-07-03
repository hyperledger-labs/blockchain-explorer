/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TransactionView from '../View/TransactionView';
import FontAwesome from 'react-fontawesome';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dialogOpen: false
    };
  }

  handleDialogOpen = async (tid) => {
    await this.props.getTransaction(this.props.channel.currentChannel, tid);
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleEye = (row, val) => {
    const data = Object.assign({}, this.state.selection, { [row.index]: !val });
    this.setState({ selection: data });
  };
  componentDidMount() {
    const selection = {};
    this.props.transactionList.forEach(element => {
      selection[element.blocknum] = false;
    });
    this.setState({ selection: selection });
  }

  render() {
    const columnHeaders = [
      {
        Header: 'Creator',
        accessor: 'creator_msp_id',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['creator_msp_id'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Tx Id',
        accessor: 'txhash',
        Cell: row => (
          <span>
            <a
              className="transactionLink"
              onClick={() => this.handleDialogOpen(row.value)}
              href="#/transactions"
            >
              {" "}
              {this.state.selection && this.state.selection[row.index]
                ? row.value
                : row.value.slice(0, 6)}{" "}
            </a>
            <span
              onClick={() =>
                this.handleEye(row, this.state.selection[row.index])
              }
            >
              {row.value && <FontAwesome name="eye" className="eyeBtn" />}
            </span>
          </span>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["txhash"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Type",
        accessor: "type",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["type"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Chaincode",
        accessor: "chaincodename",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["chaincodename"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Timestamp",
        accessor: "createdt",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["createdt"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
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
          minRows={0}
          showPagination={ this.props.transactionList.length < 5  ?  false : true }

        />

        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <TransactionView
            transaction={this.props.transaction}
            onClose={this.handleDialogClose}
          />
        </Dialog>
      </div>
    );
  }
}

export default Transactions;
