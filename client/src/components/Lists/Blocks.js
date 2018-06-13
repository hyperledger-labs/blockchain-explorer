/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Container, Row, Col, Tooltip } from 'reactstrap';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TransactionView from '../View/TransactionView';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      loading: false,
      totalBlocks: this.props.countHeader.latestBlock
    }
  }

  handleDialogOpen = (tid) => {
    this.props.getTransactionInfo(this.props.channel.currentChannel, tid);
    this.setState({ dialogOpen: true });
  }

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ totalBlocks: this.props.countHeader.latestBlock });
  }

  componentDidMount() {
    setInterval(() => {
      this.props.getBlockList(this.props.channel.currentChannel);
    }, 60000)
  }

  reactTableSetup = () => {
    return (
      [
        {
          Header: "Block Number",
          accessor: "blocknum",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["blocknum"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true,
          width: 150
        },
        {
          Header: "Number of Tx",
          accessor: "txcount",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["txcount"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true,
          width: 150
        },
        {
          Header: "Data Hash",
          accessor: "datahash",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["datahash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true
        },
        {
          Header: "Block Hash",
          accessor: "blockhash",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["blockhash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true
        },
        {
          Header: "Previous Hash",
          accessor: "prehash",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["prehash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true,
          width: 150
        },
        {
          Header: "Transactions",
          accessor: "txhash",
          Cell: row => (
            <ul>
              {row.value.map(tid =>
                <li key={tid} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  <a className="hash-hide" onClick={() => this.handleDialogOpen(tid)} href="#/blocks" >{tid}</a>
                </li>
              )}
            </ul>
          ),
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["txhash"] }, { threshold: matchSorter.rankings.SIMPLEMATCH }),
          filterAll: true
        }
      ]
    )
  }

  render() {
    return (
      <div >
        <ReactTable
          data={this.props.blockList}
          columns={this.reactTableSetup()}
          defaultPageSize={10}
          className="-striped -highlight"
          filterable
          minRows={0} />
        <Dialog open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth={true}
          maxWidth={'md'}>
          <TransactionView transaction={this.props.transaction} />
        </Dialog>
      </div >
    );
  }
};

export default Blocks;
