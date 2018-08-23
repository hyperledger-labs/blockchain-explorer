/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import { Button } from 'reactstrap';
import matchSorter from 'match-sorter';
import find from 'lodash/find';
import ReactTable from '../Styled/Table';
import BlockView from '../View/BlockView';
import TransactionView from '../View/TransactionView';
import MultiSelect from '../Styled/MultiSelect';
import moment from 'moment';
import DatePicker from '../Styled/DatePicker';
import { isNull } from 'util';
import {
  blockListType,
  currentChannelType,
  getTransactionType,
  transactionType
} from '../types';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    hash: {
      '&, & li, & ul': {
        overflow: 'visible !important'
      }
    },
    partialHash: {
      textAlign: 'center',
      position: 'relative !important',
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
      },
      '&:hover $lastFullHash': {
        display: 'block',
        position: 'absolute !important',
        padding: '4px 4px',
        backgroundColor: dark ? '#5e558e' : '#000000',
        marginTop: -30,
        marginLeft: -415,
        borderRadius: 8,
        color: '#ffffff',
        opacity: dark ? 1 : undefined
      }
    },
    fullHash: {
      display: 'none'
    },
    lastFullHash: {
      display: 'none'
    },
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

export class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogOpenBlockHash: false,
      err: false,
      search: false,
      to: moment(),
      orgs: [],
      options: [],
      filtered: [],
      sorted: [],
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
      nextProps.currentChannel !== this.props.currentChannel
    ) {
      if (this.interval !== undefined) {
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
  handleCustomRender(selected, options) {
    if (selected.length === 0) {
      return 'Select Orgs';
    }
    if (selected.length === options.length) {
      return 'All Orgs Selected';
    }

    return selected.join(',');
  }

  searchBlockList = async channel => {
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
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.searchBlockList();
    }, 60000);
    await this.searchBlockList();
    this.setState({ search: true });
  };

  handleClearSearch = () => {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.setState({
      search: false,
      to: moment(),
      orgs: [],
      err: false,
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

  reactTableSetup = classes => [
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
      className: classes.hash,
      Cell: row => (
        <span>
          <ul className={classes.partialHash} href="#/blocks">
            <div className={classes.fullHash} id="showTransactionId">
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
      className: classes.hash,
      Cell: row => (
        <span>
          <a
            data-command="block-partial-hash"
            className={classes.partialHash}
            onClick={() => this.handleDialogOpenBlockHash(row.value)}
            href="#/blocks"
          >
            <div className={classes.fullHash} id="showTransactionId">
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
      className: classes.hash,
      Cell: row => (
        <span>
          <ul
            className={classes.partialHash}
            onClick={() => this.handleDialogOpenBlockHash(row.value)}
            href="#/blocks"
          >
            <div className={classes.fullHash} id="showTransactionId">
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
      className: classes.hash,
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
                    className={classes.partialHash}
                    onClick={() => this.handleDialogOpen(tid)}
                    href="#/blocks"
                  >
                    <div
                      className={classes.lastFullHash}
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
    const { transaction, classes } = this.props;
    const { blockHash, dialogOpen, dialogOpenBlockHash } = this.state;
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
          data={blockList}
          columns={this.reactTableSetup(classes)}
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

export default withStyles(styles)(Blocks);
