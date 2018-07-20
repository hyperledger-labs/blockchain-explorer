/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import { channelsType } from '../types';

class Channels extends Component {
  reactTableSetup = () => [
    {
      Header: 'ID',
      accessor: 'id',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['id'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
      width: 100,
    },
    {
      Header: 'Channel Name',
      accessor: 'channelname',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['channelname'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Channel Hash',
      accessor: 'channel_hash',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['channel_hash'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Blocks',
      accessor: 'blocks',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['blocks'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
      width: 125,
    },
    {
      Header: 'Transactions',
      accessor: 'transactions',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['transactions'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
      width: 125,
    },
    {
      Header: 'Timestamp',
      accessor: 'createdat',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['createdat'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
  ];

  render() {
    const { channels } = this.props;
    return (
      <div className="blockPage">
        <ReactTable
          data={channels}
          columns={this.reactTableSetup()}
          defaultPageSize={5}
          className="-striped -highlight"
          filterable
          minRows={0}
          showPagination={!(channels.length < 5)}
        />
      </div>
    );
  }
}

Channels.propTypes = {
  channels: channelsType.isRequired,
};

export default Channels;
