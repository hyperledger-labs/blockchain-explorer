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
      totalBlocks: this.props.countHeader.txCount,
      dialogOpen: false
    };
  }

  convertTime = date => {
    var hold = new Date(date);
    var hours = hold.getHours();
    var minutes = hold.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  handleDialogOpen = tid => {
    this.props.getTransactionInfo(this.props.channel.currentChannel, tid);
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ totalBlocks: this.props.countHeader.txCount });
  }

  componentDidMount() {

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
          <a onClick={() => this.handleDialogOpen(row.value)} href="#" >{row.value}</a>
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
        <Container>
          <Row>
            <Col>
              <div className="scrollTable">
                <ReactTable
                  data={this.props.transactionList}
                  columns={columnHeaders}
                  defaultPageSize={10}
                  className="-striped -highlight"
                  filterable
                />
              </div>
            </Col>
          </Row>
        </Container>
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
