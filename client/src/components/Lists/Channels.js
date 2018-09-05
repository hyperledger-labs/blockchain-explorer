/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';

class Channels extends Component {
  constructor(props) {
    super(props);
  }

  reactTableSetup = () => {
    return [
      {
        Header: 'ID',
        accessor: 'id',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['id'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true,
        width: 100
      },
      {
        Header: '渠道名称',
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
        Header: '渠道哈希',
        accessor: 'channel_hash',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['channel_hash'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: '区块编号',
        accessor: 'blocks_',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['blocks'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true,
        width: 125
      },
      {
        Header: '累计交易',
        accessor: 'transactions_',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['transactions'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true,
        width: 125
      },
      {
        Header: '时间戳',
        accessor: 'createdat',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['createdat'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
    ];
  };

  render() {
    return (
      <div className="blockPage">
        <ReactTable
          data={this.props.channels}
          columns={this.reactTableSetup()}
          defaultPageSize={5}
          className="-striped -highlight"
          filterable
          minRows={0}
          showPagination={this.props.channels.length < 5 ? false : true}
        />
      </div>
    );
  }
}

export default Channels;
