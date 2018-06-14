/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";


class Channels extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    //   channelsCount: this.props.countHeader.chaincodeCount,
    //   dialogOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {  }
  componentWillMount() {
   this.props.getChannels()
  }
  componentDidMount() {
    setInterval(() => {
    this.props.getChannels()
    }, 600000);
  }

  reactTableSetup = () => {
    return [
      {
        Header: "Id",
        accessor: "id",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["id"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Channel Name",
        accessor: "channelname",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["channelname"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Channel Hash",
        accessor: "channel_hash",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["channel_hash"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Blocks",
        accessor: "blocks",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["blocks"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }, {
        Header: "Transactions",
        accessor: "transactions",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["transactions"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Created At",
        accessor: "createdat",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["createdat"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }
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
                />

      </div>
    );
  }
}

export default Channels;