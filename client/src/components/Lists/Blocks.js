/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, {Component} from "react";
import Dialog from "material-ui/Dialog";
import TransactionView from "../View/TransactionView";
import BlockView from "../View/BlockView";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";
import FontAwesome from "react-fontawesome";
import find from "lodash/find";

class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      loading: false,
      dialogOpenBlockHash: false,
      blockHash: {}
    };
  }

  handleDialogOpen = async tid => {
    await this.props.getTransaction(this.props.currentChannel, tid);
    this.setState({dialogOpen: true});
  };

  handleDialogClose = () => {
    //this.props.removeTransactionInfo();
    this.setState({dialogOpen: false});
  };

  handleDialogOpenBlockHash = blockHash => {
    const data = find(this.props.blockList, item => {
      return item.blockhash === blockHash;
    });

    this.setState({
      dialogOpenBlockHash: true,
      blockHash: data
    });
  };

  handleDialogCloseBlockHash = () => {
    this.setState({dialogOpenBlockHash: false});
  };

  handleEye = (row, val) => {
    const data = Object.assign({}, this.state.selection, {[row.index]: !val});
    this.setState({selection: data});
  };

  componentDidMount() {
    const selection = {};
    this.props.blockList.forEach(element => {
      selection[element.blocknum] = false;
    });
    this.setState({selection: selection});
  }

  reactTableSetup = () => {
    return [
      {
        Header: "Block Number",
        accessor: "blocknum",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["blocknum"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true,
        width: 150
      },
      {
        Header: "Channel Name",
        accessor: "channelname",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["channelname"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true
      },
      {
        Header: "Number of Tx",
        accessor: "txcount",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["txcount"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true,
        width: 150
      },
      {
        Header: "Data Hash",
        accessor: "datahash",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["datahash"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true
      },
      {
        Header: "Block Hash",
        accessor: "blockhash",
        Cell: row => (
          <span>
            <a
              className="partialHash"
              onClick={() => this.handleDialogOpenBlockHash(row.value)}
              href="#/blocks"
            >
              <div className="fullHash" id="showTransactionId">
                {row.value}
              </div>{" "}
              {row.value.slice(0, 6)} {!row.value ? "" : "... "}
            </a>{" "}
          </span>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["blockhash"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true
      },
      {
        Header: "Previous Hash",
        accessor: "prehash",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["prehash"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true,
        width: 150
      },
      {
        Header: "Transactions",
        accessor: "txhash",
        Cell: row => (
          <ul>
            {row.value.map(tid => (
              <li
                key={tid}
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis"
                }}
              >
                <a
                  className="partialHash"
                  onClick={() => this.handleDialogOpen(tid)}
                  href="#/blocks"
                >
                  <div className="fullHash" id="showTransactionId">
                    {tid}
                  </div>{" "}
                  {tid.slice(0, 6)} {!tid ? "" : "... "}
                </a>
              </li>
            ))}
          </ul>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            {keys: ["txhash"]},
            {threshold: matchSorter.rankings.SIMPLEMATCH}
          ),
        filterAll: true
      }
    ];
  };

  render() {
    return (
      <div>
        <ReactTable
          data={this.props.blockList}
          columns={this.reactTableSetup()}
          defaultPageSize={10}
          className="-striped -highlight"
          filterable
          minRows={0}
          showPagination={this.props.blockList.length < 5 ? false : true}
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

        <Dialog
          open={this.state.dialogOpenBlockHash}
          onClose={this.handleDialogCloseBlockHash}
          fullWidth={true}
          maxWidth={"md"}
        >
          <BlockView
            blockHash={this.state.blockHash}
            onClose={this.handleDialogCloseBlockHash}
          />
        </Dialog>
      </div>
    );
  }
}

export default Blocks;
