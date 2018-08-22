/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Badge } from 'reactstrap';
import ReactTable from '../Styled/Table';
import { peerStatusType } from '../types';

const styles = theme => {
  return {
    table: {
      height: 335,
      overflowY: 'scroll'
    },
    center: {
      textAlign: 'center'
    }
  };
};

const PeersHealth = ({ peerStatus, classes }) => {
  const columnHeaders = [
    {
      Header: 'Peer Name',
      accessor: 'server_hostname',
      filterAll: false,
      className: classes.center
    },
    {
      Header: 'Status',
      accessor: 'status',
      filterAll: false,
      className: classes.center,
      Cell: row => <Badge color="success">{row.value}</Badge>
    }
  ];
  return (
    <div>
      <ReactTable
        data={peerStatus}
        columns={columnHeaders}
        className={classes.table}
        minRows={0}
        showPagination={false}
      />
    </div>
  );
};

PeersHealth.propTypes = {
  peerStatus: peerStatusType.isRequired
};

export default withStyles(styles)(PeersHealth);
