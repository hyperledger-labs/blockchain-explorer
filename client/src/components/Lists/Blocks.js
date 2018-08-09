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
import Select from 'react-select';

import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
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
      search: false,
      to: moment().utc(),
      orgs: [],
      options: [],
      from: moment()
        .utc()
        .subtract(1, 'days'),
      blockHash: {}
    };
  }

  componentDidMount() {
    const { blockList } = this.props;
    const selection = {};
    blockList.forEach(element => {
      selection[element.blocknum] = false;
    });
    this.props.getOrgs(this.props.currentChannel).then(() => {
      let opts = [];
      this.props.orgs.forEach(val => {
        opts.push({ label: val, value: val });
      });
      this.setState({ selection, options: opts });
    });
  }

  handleDialogOpen = async tid => {
    const { getTransaction, currentChannel } = this.props;
    await getTransaction(currentChannel, tid);
    this.setState({ dialogOpen: true });
  };
  handleMultiSelect = value => {
    console.log(this.state.orgs);
    this.setState({ orgs: value });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };
  handleSearch = async () => {
    let query = `from=${new Date(this.state.from).toISOString()}&&to=${new Date(
      this.state.to
    ).toISOString()}`;
    for (let i = 0; i < this.state.orgs.length; i++) {
      query += `&&orgs=${this.state.orgs[i].value}`;
    }
    await this.props.getBlockListSearch(this.props.currentChannel, query);
    this.setState({ search: true });
  };
  handleClearSearch = () => {
    this.setState({
      search: false,
      to: moment().utc(),
      orgs: [],
      from: moment()
        .utc()
        .subtract(1, 'days')
    });
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
    const blockList = this.state.search
      ? this.props.blockListSearch
      : this.props.blockList;
    const { transaction } = this.props;
    const { blockHash, dialogOpen, dialogOpenBlockHash } = this.state;
    return (
      <div>
        <div className="filter">
          <div className="filter">
            <label htmlFor="from" className="label">
              From
            </label>
            <DatePicker
              id="from"
              selected={this.state.from}
              showTimeSelect
              maxDate={moment()}
              timeIntervals={5}
              dateFormat="LLL"
              utcOffset={moment().utcOffset()}
              onChange={date => {
                console.log(date);
                this.setState({ from: date });
              }}
            />
          </div>
          <div className="filter">
            <label htmlFor="to" className="label">
              To
            </label>
            <DatePicker
              id="to"
              selected={this.state.to}
              showTimeSelect
              maxDate={moment()}
              timeIntervals={5}
              dateFormat="LLL"
              utcOffset={moment().utcOffset()}
              onChange={date => {
                console.log(date);
                this.setState({ to: date });
              }}
            />
          </div>

          <Select
            className="orgs-dropdown"
            multi={true}
            value={this.state.orgs}
            options={this.state.options}
            onChange={value => {
              this.handleMultiSelect(value);
            }}
          />
          <button
            onClick={async () => {
              await this.handleSearch();
            }}
          >
            Search
          </button>
          <button
            onClick={() => {
              this.handleClearSearch();
            }}
          >
            Reset
          </button>
        </div>
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
