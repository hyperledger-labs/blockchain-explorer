/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import Dialog from 'material-ui/Dialog';
import ChaincodeForm from '../Forms/ChaincodeForm';
import ChaincodeModal from '../View/ChaincodeModal';
import { chaincodeListType } from '../types';

class Chaincodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      sourceDialog: false,
      chaincode: {},
    };
  }

  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  sourceDialogOpen = (chaincode) => {
    this.setState({ chaincode });
    this.setState({ sourceDialog: true });
  };

  sourceDialogClose = () => {
    this.setState({ sourceDialog: false });
  };

  reactTableSetup = () => [
    {
      Header: 'Chaincode Name',
      accessor: 'chaincodename',
      Cell: row => (
        <a className="hash-hide" onClick={() => this.sourceDialogOpen(row.original)} href="#/chaincodes">
          {row.value}
        </a>
      ),
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['chaincodename'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Channel Name',
      accessor: 'channelName',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['channelName'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Path',
      accessor: 'path',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['path'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Transaction Count',
      accessor: 'txCount',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['txCount'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
    {
      Header: 'Version',
      accessor: 'version',
      filterMethod: (filter, rows) => matchSorter(
        rows,
        filter.value,
        { keys: ['version'] },
        { threshold: matchSorter.rankings.SIMPLEMATCH },
      ),
      filterAll: true,
    },
  ];

  render() {
    const { chaincodeList } = this.props;
    const { dialogOpen, sourceDialog, chaincode } = this.state;
    return (
      <div>
        {/* <Button className="button" onClick={() => this.handleDialogOpen()}>
          Add Chaincode
          </Button> */}
        <ReactTable
          data={chaincodeList}
          columns={this.reactTableSetup()}
          defaultPageSize={5}
          className="-striped -highlight"
          filterable
          minRows={0}
          showPagination={!(chaincodeList.length < 5)}
        />
        <Dialog
          open={dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth
          maxWidth="md"
        >
          <ChaincodeForm />
        </Dialog>
        <Dialog
          open={sourceDialog}
          onClose={this.sourceDialogClose}
          fullWidth
          maxWidth="md"
        >
          <ChaincodeModal chaincode={chaincode} />
        </Dialog>
      </div>
    );
  }
}

Chaincodes.propTypes = {
  chaincodeList: chaincodeListType.isRequired,
};

export default Chaincodes;
