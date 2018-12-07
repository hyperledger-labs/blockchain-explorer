/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import matchSorter from 'match-sorter';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import ReactTable from '../Styled/Table';
import ChaincodeForm from '../Forms/ChaincodeForm';
import ChaincodeModal from '../View/ChaincodeModal';
import { chaincodeListType } from '../types';
import ChaincodeInitForm from '../Forms/ChaincodeInitForm';
import ChaincodeAlert from '../Alert/ChaincodeAlert';

const styles = theme => ({
  hash: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 60,
    letterSpacing: '2px'
  }
});

export class Chaincodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      installDialog: false,
      sourceDialog: false,
      chaincode: {},
      initDialog: false,
      respPopup: false,
      installedChaincode: {},
      payload: {},
      reqType: {}
    };
  }

  handleInstallDialogOpen = () => {
    this.setState({ installDialog: true });
  };

  handleInstallDialogClose = () => {
    this.setState({ installDialog: false });
  };

  sourceDialogOpen = chaincode => {
    this.setState({ chaincode });
    this.setState({ sourceDialog: true });
  };

  sourceDialogClose = () => {
    this.setState({ sourceDialog: false });
  };

  handleInitDialogOpen = payload => {
    this.setState({
      initDialog: true,
      installedChaincode: payload
    });
  };

  handleChaincodeRequest = (type, payload) => {
    this.setState({
      payload: payload,
      reqType: type
    });
    type === 'install'
      ? this.handleInstallDialogClose()
      : this.handleInitDialogClose();
    this.respPopupOpen();
  };

  respPopupOpen = () => {
    this.setState({ respPopup: true });
  };

  respPopupClose = (reqType, success, payload) => {
    this.setState({ respPopup: false });
    if ('install' === reqType && success === true) {
      this.handleInitDialogOpen(payload);
    }
  };

  reactTableSetup = classes => [
    {
      Header: 'Chaincode Name',
      accessor: 'chaincodename',
      Cell: row => (
        <a
          className={classes.hash}
          onClick={() => this.sourceDialogOpen(row.original)}
          href="#/chaincodes"
        >
          {row.value}
        </a>
      ),
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
      Header: 'Channel Name',
      accessor: 'channelName',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['channelName'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Path',
      accessor: 'path',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['path'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Transaction Count',
      accessor: 'txCount',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['txCount'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    },
    {
      Header: 'Version',
      accessor: 'version',
      filterMethod: (filter, rows) =>
        matchSorter(
          rows,
          filter.value,
          { keys: ['version'] },
          { threshold: matchSorter.rankings.SIMPLEMATCH }
        ),
      filterAll: true
    }
  ];

  render() {
    const { chaincodeList, peerList, classes } = this.props;
    const { installDialog, sourceDialog, chaincode } = this.state;
    return (
      <div>
        <Button
          className="button"
          onClick={() => this.handleInstallDialogOpen()}
        >
          Add Chaincode
        </Button>
        <ReactTable
          data={chaincodeList}
          columns={this.reactTableSetup(classes)}
          defaultPageSize={5}
          filterable
          minRows={0}
          showPagination={!(chaincodeList.length < 5)}
        />
        <Dialog
          open={installDialog}
          onClose={this.handleInstallDialogClose}
          fullWidth
          maxWidth="md"
        >
          <ChaincodeForm
            handleDialog={this.handleChaincodeRequest}
            peerList={peerList}
          />
        </Dialog>
        <Dialog
          open={sourceDialog}
          onClose={this.sourceDialogClose}
          fullWidth
          maxWidth="md"
        >
          <ChaincodeModal chaincode={chaincode} />
        </Dialog>
        <Dialog
          open={this.state.initDialog}
          onClose={this.handleInitDialogClose}
          fullWidth={true}
          maxWidth={'md'}
        >
          <ChaincodeInitForm
            peerList={peerList}
            chaincodeInfo={this.state.installedChaincode}
            handleDialog={this.handleChaincodeRequest}
          />
        </Dialog>
        <Dialog open={this.state.respPopup} onClose={this.respPopupClose}>
          <ChaincodeAlert
            payload={this.state.payload}
            reqType={this.state.reqType}
            handleClose={this.respPopupClose}
          />
        </Dialog>
      </div>
    );
  }
}

Chaincodes.propTypes = {
  chaincodeList: chaincodeListType.isRequired
};

export default withStyles(styles)(Chaincodes);
