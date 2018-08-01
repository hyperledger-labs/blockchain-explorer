/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import find from 'lodash/find';
import BlockView from '../View/BlockView';
import TransactionView from '../View/TransactionView';
import {
  blockListType,
  currentChannelType,
  getTransactionType,
  transactionType
} from '../types';

class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogOpenBlockHash: false,
      blockHash: {}
    };
  }

  componentDidMount() {
    const { blockList } = this.props;
    const selection = {};
    blockList.forEach(element => {
      selection[element.blocknum] = false;
    });
    this.setState({ selection });
  }

  handleDialogOpen = async tid => {
    const { getTransaction, currentChannel } = this.props;
    await getTransaction(currentChannel, tid);
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleDialogOpenBlockHash = blockHash => {
    const { blockList } = this.props;
    const data = find(blockList, item => item.blockhash === blockHash);

    this.setState({
      dialogOpenBlockHash: true,
      blockHash: data
    });
  };

  handleDialogCloseBlockHash = () => {
    this.setState({ dialogOpenBlockHash: false });
  };

  handleEye = (row, val) => {
    const { selection } = this.state;
    const data = Object.assign({}, selection, { [row.index]: !val });
    this.setState({ selection: data });
  };

  reactTableSetup = () => [
    {
      Header: 'Block Number',
      accessor: 'blocknum',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['blocknum'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true,
      width: 150
    },
    {
      Header: 'Channel Name',
      accessor: 'channelname',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['channelname'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Number of Tx',
      accessor: 'txcount',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['txcount'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true,
      width: 150
    },
    {
      Header: 'Data Hash',
      accessor: 'datahash',
      className: 'hashCell',
      Cell: row => (
        <span>
          <ul className="partialHashes" href="#/blocks">
            <div className="fullHash" id="showTransactionId">
              {row.value}
            </div>{' '}
            {row.value.slice(0, 6)} {!row.value ? '' : '... '}
          </ul>{' '}
        </span>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['datahash'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Block Hash',
      accessor: 'blockhash',
      className: 'hashCell',
      Cell: row => (
        <span>
          <a
            className="partialHash"
            onClick={() => this.handleDialogOpenBlockHash(row.value)}
            href="#/blocks"
          >
            <div className="fullHash" id="showTransactionId">
              {row.value}
            </div>{' '}
            {row.value.slice(0, 6)} {!row.value ? '' : '... '}
          </a>{' '}
        </span>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['blockhash'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Previous Hash',
      accessor: 'prehash',
      className: 'hashCell',
      Cell: row => (
        <span>
          <ul
            className="partialHashes"
            onClick={() => this.handleDialogOpenBlockHash(row.value)}
            href="#/blocks"
          >
            <div className="fullHash" id="showTransactionId">
              {row.value}
            </div>{' '}
            {row.value.slice(0, 6)} {!row.value ? '' : '... '}
          </ul>{' '}
        </span>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['prehash'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true,
      width: 150
    },
    {
      Header: 'Transactions',
      accessor: 'txhash',
      className: 'hashCell',
      Cell: row => (
        <ul>
          {row.value.map(tid => (
            <li
              key={tid}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              <a
                className="partialHash"
                onClick={() => this.handleDialogOpen(tid)}
                href="#/blocks"
              >
                <div className="fullHash lastFullHash" id="showTransactionId">
                  {tid}
                </div>{' '}
                {tid.slice(0, 6)} {!tid ? '' : '... '}
              </a>
            </li>
          ))}
        </ul>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['txhash'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    }
  ];

  render() {
    const { blockList, transaction } = this.props;
    const { blockHash, dialogOpen, dialogOpenBlockHash } = this.state;
    return (
      <div>
        <ReactTable
          data={blockList}
          columns={this.reactTableSetup()}
          defaultPageSize={10}
          className="-striped -highlight listTable"
          filterable
          minRows={0}
          style={{ height: '750px' }}
          showPagination={!(blockList.length < 5)}
        />

        <Dialog
          open={dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth
          maxWidth="md"
        >
          <TransactionView
            transaction={transaction}
            onClose={this.handleDialogClose}
          />
        </Dialog>

        <Dialog
          open={dialogOpenBlockHash}
          onClose={this.handleDialogCloseBlockHash}
          fullWidth
          maxWidth="md"
        >
          <BlockView
            blockHash={blockHash}
            onClose={this.handleDialogCloseBlockHash}
          />
        </Dialog>
      </div>
    );
  }
}

Blocks.propTypes = {
  blockList: blockListType.isRequired,
  currentChannel: currentChannelType.isRequired,
  getTransaction: getTransactionType.isRequired,
  transaction: transactionType
};

Blocks.defaultProps = {
  transaction: null
};

export default Blocks;
