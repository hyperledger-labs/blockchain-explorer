/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import { Button } from 'reactstrap';
import matchSorter from 'match-sorter';
import ReactTable from '../Styled/Table';
import TransactionView from '../View/TransactionView';
import DatePicker from '../Styled/DatePicker';
import MultiSelect from '../Styled/MultiSelect';
import moment from 'moment';

import {
  currentChannelType,
  getTransactionType,
  transactionListType,
  transactionType
} from '../types';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    hash: {
      '&, & li': {
        overflow: 'visible !important'
      }
    },
    partialHash: {
      textAlign: 'center',
      position: 'relative !important',
      '&:hover $lastFullHash': {
        marginLeft: -400
      },
      '&:hover $fullHash': {
        display: 'block',
        position: 'absolute !important',
        padding: '4px 4px',
        backgroundColor: dark ? '#5e558e' : '#000000',
        marginTop: -30,
        marginLeft: -215,
        borderRadius: 8,
        color: '#ffffff',
        opacity: dark ? 1 : undefined
      }
    },
    fullHash: {
      display: 'none'
    },
    lastFullHash: {},
    filter: {
      width: '100%',
      textAlign: 'center',
      margin: '0px !important'
    },
    filterButton: {
      opacity: 0.8,
      margin: 'auto',
      width: '100% !important',
      'margin-bottom': '4px'
    },
    searchButton: {
      opacity: 0.8,
      margin: 'auto',
      width: '100% !important',
      backgroundColor: dark ? undefined : '#086108',
      'margin-bottom': '4px'
    },
    filterElement: {
      textAlign: 'center',
      display: 'flex',
      padding: '0px !important',
      '& > div': {
        width: '100% !important',
        marginTop: 20
      },
      '& .label': {
        margin: '25px 10px 0px 10px'
      }
    }
  };
};

export class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      search: false,
      to: moment(),
      orgs: [],
      options: [],
      filtered: [],
      sorted: [],
      err: false,
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
  componentWillReceiveProps(nextProps) {
    if (
      this.state.search &&
      nextProps.currentChannel !== this.props.currentChannel
    ) {
      if (this.interval !== undefined) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        this.searchTransactionList(nextProps.currentChannel);
      }, 60000);
      this.searchTransactionList(nextProps.currentChannel);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interVal);
  }
  handleCustomRender(selected, options) {
    if (selected.length === 0) {
      return 'Select Orgs';
    }
    if (selected.length === options.length) {
      return 'All Orgs Selected';
    }

    return selected.join(',');
  }
  searchTransactionList = async channel => {
    let query = `from=${new Date(this.state.from).toString()}&&to=${new Date(
      this.state.to
    ).toString()}`;
    for (let i = 0; i < this.state.orgs.length; i++) {
      query += `&&orgs=${this.state.orgs[i]}`;
    }
    let channelhash = this.props.currentChannel;
    if (channel !== undefined) {
      channelhash = channel;
    }
    await this.props.getTransactionListSearch(channelhash, query);
  };

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
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.searchTransactionList();
    }, 60000);
    await this.searchTransactionList();
    this.setState({ search: true });
  };

  handleClearSearch = () => {
    this.setState({
      search: false,
      to: moment(),
      orgs: [],
      err: false,
      from: moment().subtract(1, 'days')
    });
  };

  handleEye = (row, val) => {
    const { selection } = this.state;
    const data = Object.assign({}, selection, { [row.index]: !val });
    this.setState({ selection: data });
  };

  render() {
    const { classes } = this.props;
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
        className: classes.hash,
        Cell: row => (
          <span>
            <a
              data-command="transaction-partial-hash"
              className={classes.partialHash}
              onClick={() => this.handleDialogOpen(row.value)}
              href="#/transactions"
            >
              <div className={classes.fullHash} id="showTransactionId">
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
        <div className={`${classes.filter} row searchRow`}>
          <div className={`${classes.filterElement} col-md-3`}>
            <label className="label">From</label>
            <DatePicker
              id="from"
              selected={this.state.from}
              showTimeSelect
              timeIntervals={5}
              dateFormat="LLL"
              onChange={date => {
                if (date > this.state.to) {
                  this.setState({ err: true, from: date });
                } else {
                  this.setState({ from: date, err: false });
                }
              }}
            />
          </div>
          <div className={`${classes.filterElement} col-md-3`}>
            <label className="label">To</label>
            <DatePicker
              id="to"
              selected={this.state.to}
              showTimeSelect
              timeIntervals={5}
              dateFormat="LLL"
              onChange={date => {
                if (date > this.state.from) {
                  this.setState({ to: date, err: false });
                } else {
                  this.setState({ err: true, to: date });
                }
              }}
            >
              <div className="validator ">
                {this.state.err && (
                  <span className=" label border-red">
                    {' '}
                    From date should be less than To date
                  </span>
                )}
              </div>
            </DatePicker>
          </div>
          <div className="col-md-2">
            <MultiSelect
              hasSelectAll={true}
              valueRenderer={this.handleCustomRender}
              shouldToggleOnHover={false}
              selected={this.state.orgs}
              options={this.state.options}
              selectAllLabel={'All Orgs'}
              onSelectedChanged={value => {
                this.handleMultiSelect(value);
              }}
            />
          </div>
          <div className="col-md-2">
            <Button
              className={classes.searchButton}
              color="success"
              disabled={this.state.err}
              onClick={async () => {
                await this.handleSearch();
              }}
            >
              Search
            </Button>
          </div>
          <div className="col-md-1">
            <Button
              className={classes.filterButton}
              color="primary"
              onClick={() => {
                this.handleClearSearch();
              }}
            >
              Reset
            </Button>
          </div>
          <div className="col-md-1">
            <Button
              className={classes.filterButton}
              color="secondary"
              onClick={() => this.setState({ filtered: [], sorted: [] })}
            >
              Clear Filter
            </Button>
          </div>
        </div>
        <ReactTable
          data={transactionList}
          columns={columnHeaders}
          defaultPageSize={10}
          list
          filterable
          sorted={this.state.sorted}
          onSortedChange={sorted => {
            this.setState({ sorted });
          }}
          filtered={this.state.filtered}
          onFilteredChange={filtered => {
            this.setState({ filtered });
          }}
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

export default withStyles(styles)(Transactions);
