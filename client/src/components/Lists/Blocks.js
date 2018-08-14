/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Button, timeoutsShape } from 'reactstrap';
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
import { isNull } from 'util';
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
      to: moment(),
      orgs: [],
      options: [],
      from: moment().subtract(1, 'days'),
      blockHash: {}
    };
  }

  componentDidMount() {
    const { blockList } = this.props;
    const selection = {};
    blockList.forEach(element => {
      selection[element.blocknum] = false;
    });
    let opts = [];
    this.props.transactionByOrg.forEach(val => {
      opts.push({ label: val.creator_msp_id, value: val.creator_msp_id });
    });
    this.setState({ selection, options: opts });
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.state.search &&
      nextProps.currentChannel != this.props.currentChannel
    ) {
      if (this.interval != undefined) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        this.searchBlockList(nextProps.currentChannel);
      }, 60000);
      this.searchBlockList(nextProps.currentChannel);
    }
  }
  componentWillUnmount() {
    clearInterval(this.interVal);
  }
  searchBlockList = async channel => {
    let query = `from=${new Date(this.state.from).toString()}&&to=${new Date(
      this.state.to
    ).toString()}`;
    for (let i = 0; i < this.state.orgs.length; i++) {
      query += `&&orgs=${this.state.orgs[i].value}`;
    }
    let channelhash = this.props.currentChannel;
    if (channel != undefined) {
      channelhash = channel;
    }
    await this.props.getBlockListSearch(channelhash, query);
  };
  handleDialogOpen = async tid => {
    const { getTransaction, currentChannel } = this.props;
    await getTransaction(currentChannel, tid);
    this.setState({ dialogOpen: true });
  };
  handleMultiSelect = value => {
    this.setState({ orgs: value });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };
  handleSearch = async () => {
    if (this.interval != undefined) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.searchBlockList();
    }, 60000);
    await this.searchBlockList();
    this.setState({ search: true });
  };
  handleClearSearch = () => {
    if (this.interval != undefined) {
      clearInterval(this.interval);
    }
    this.setState({
      search: false,
      to: moment(),
      orgs: [],
      from: moment().subtract(1, 'days')
    });
  };
  handleDialogOpenBlockHash = blockHash => {
    const blockList = this.state.search
      ? this.props.blockListSearch
      : this.props.blockList;
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
          {!isNull(row.value)
            ? row.value.map(tid => (
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
                    <div
                      className="fullHash lastFullHash"
                      id="showTransactionId"
                    >
                      {tid}
                    </div>{' '}
                    {tid.slice(0, 6)} {!tid ? '' : '... '}
                  </a>
                </li>
              ))
            : 'null'}
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
        <div className="filter row">
          <div className="col-md-2" />
          <div className="filterElement col-md-3">
            <label className="label">From</label>
            <DatePicker
              id="from"
              selected={this.state.from}
              showTimeSelect
              maxDate={moment()}
              timeIntervals={5}
              dateFormat="LLL"
              onChange={date => {
                this.setState({ from: date });
              }}
            />
          </div>
          <div className="filterElement col-md-3">
            <label className="label">To</label>
            <DatePicker
              id="to"
              selected={this.state.to}
              showTimeSelect
              maxDate={moment()}
              timeIntervals={5}
              dateFormat="LLL"
              onChange={date => {
                this.setState({ to: date });
              }}
            />
          </div>

          <Select
            className=" col-md-2"
            multi={true}
            value={this.state.orgs}
            options={this.state.options}
            onChange={value => {
              this.handleMultiSelect(value);
            }}
          />
          <div className=" col-md-1">
            <Button
              className="filterButton"
              color="success"
              onClick={async () => {
                await this.handleSearch();
              }}
            >
              Search
            </Button>
          </div>
          <div className=" col-md-1">
            <Button
              className="filterButton"
              color="primary"
              onClick={() => {
                this.handleClearSearch();
              }}
            >
              Reset
            </Button>
          </div>
          <div className="col-md-1" />
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
