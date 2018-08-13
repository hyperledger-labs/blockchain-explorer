/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import ReactTable from 'react-table';
import { Button } from 'reactstrap';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import TransactionView from '../View/TransactionView';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css';

import {
  currentChannelType,
  getTransactionType,
  transactionListType,
  transactionType
} from '../types';

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      search: false,
      to: moment(),
      orgs: [],
      options: [],
      from: moment().subtract(1, 'days')
    };
  }

  componentDidMount() {
    const { transactionList } = this.props;
    const selection = {};
    transactionList.forEach(element => {
      selection[element.blocknum] = false;
    });
    let opts = [];
    this.props.transactionByOrg.forEach(val => {
      opts.push({ label: val.creator_msp_id, value: val.creator_msp_id });
    });
    this.setState({ selection, options: opts });
  }

  handleDialogOpen = async tid => {
    const { currentChannel, getTransaction } = this.props;
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
    let query = `from=${new Date(this.state.from).toString()}&&to=${new Date(
      this.state.to
    ).toString()}`;
    for (let i = 0; i < this.state.orgs.length; i++) {
      query += `&&orgs=${this.state.orgs[i].value}`;
    }
    await this.props.getTransactionListSearch(this.props.currentChannel, query);
    this.setState({ search: true });
  };
  handleClearSearch = () => {
    this.setState({
      search: false,
      to: moment(),
      orgs: [],
      from: moment().subtract(1, 'days')
    });
  };

  handleEye = (row, val) => {
    const { selection } = this.state;
    const data = Object.assign({}, selection, { [row.index]: !val });
    this.setState({ selection: data });
  };

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
        Header: 'Tx Id',
        accessor: 'txhash',
        className: 'hashCell',
        Cell: row => (
          <span>
            <a
              className="partialHash"
              onClick={() => this.handleDialogOpen(row.value)}
              href="#/transactions"
            >
              <div className="fullHash" id="showTransactionId">
                {row.value}
              </div>{' '}
              {row.value.slice(0, 6)}
              {!row.value ? '' : '... '}
            </a>
          </span>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['txhash'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Type',
        accessor: 'type',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['type'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Chaincode',
        accessor: 'chaincodename',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['chaincodename'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Timestamp',
        accessor: 'createdt',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['createdt'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }
    ];

    const transactionList = this.state.search
      ? this.props.transactionListSearch
      : this.props.transactionList;
    const { transaction } = this.props;
    const { dialogOpen } = this.state;
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
        </div>
        <ReactTable
          data={transactionList}
          columns={columnHeaders}
          defaultPageSize={10}
          className="-striped -highlight listTable"
          filterable
          minRows={0}
          style={{ height: '750px' }}
          showPagination={!(transactionList.length < 5)}
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
      </div>
    );
  }
}

Transactions.propTypes = {
  currentChannel: currentChannelType.isRequired,
  getTransaction: getTransactionType.isRequired,
  transaction: transactionType,
  transactionList: transactionListType.isRequired
};

Transactions.defaultProps = {
  transaction: null
};

export default Transactions;
