/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";
import Dialog from "material-ui/Dialog";
import ChaincodeForm from "../Forms/ChaincodeForm";

class Chaincodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      chaincodeCount: this.props.countHeader.chaincodeCount,
      dialogOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ chaincodeCount: this.props.countHeader.chaincodeCount });
  }

  componentDidMount() {
    setInterval(() => {
      this.props.getChaincodes(this.props.channel.currentChannel);
    }, 60000);
  }

  handleDialogOpen = tid => {
    this.setState({ dialogOpen: true });
  };
  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  reactTableSetup = () => {
    return [
      {
        Header: "Chaincode Name",
        accessor: "chaincodename",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["chaincodename"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Channel Name",
        accessor: "channelName",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["channelName"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Path",
        accessor: "path",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["path"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Transaction Count",
        accessor: "txCount",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["txCount"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Version",
        accessor: "version",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["version"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }
    ];
  };

  render() {
    return (
      <div className="blockPage">
        <Container>
          <Button className="button" onClick={() => this.handleDialogOpen()}>
            Add Chaincode
          </Button>
          <Row>
            <Col>
              <div className="scrollTable">
                <ReactTable
                  data={this.props.chaincodes}
                  columns={this.reactTableSetup()}
                  defaultPageSize={5}
                  className="-striped -highlight"
                  filterable
                  minRows={0}
                />
              </div>
            </Col>
          </Row>
        </Container>
        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <ChaincodeForm />
        </Dialog>
      </div>
    );
  }
}

export default Chaincodes;
