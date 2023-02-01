/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from '../Styled/Table';
import { peerStatusType } from '../types';
import Tooltip from "@mui/material/Tooltip";
import styled from "@emotion/styled";

/* eslint-disable */

const styles = theme => ({
	table: {
	  height: 335,
	  overflowY: "scroll"
	},
	center: {
	  textAlign: "left"
	},
	circle: {
	  width: "20px",
	  height: "20px",
	  display: "inline-block",
	  borderRadius: "50%"
	},
	down: {
	  backgroundColor: "red"
	},
	up: {
	  backgroundColor: "green"
	}
  
  });

const Status = styled.span`
  &.blink {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0% {
      transform: scale(1);
      opacity: 0.1;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.1;
    }
  }
`;

/* eslint-enable */

const PeersHealth = ({ peerStatus, classes }) => {
	const statusTooltip = title => {
		return (
		  <Tooltip
			title={
			  title === "DOWN" ? "Offline" : title === "UP" ? "Online" : "Fetching Status"
			}
			placement="top"
		  >
			<Status
			  className={`${classes.circle} ${
				title === "DOWN" ? classes.down : classes.up
			  } ${!title && "blink"}`}
			/>
		  </Tooltip>
		);
	  };
	const columnHeaders = [
		{
			Header: 'Peer Name',
			accessor: 'server_hostname',
			filterAll: false,
			className: classes.center
		}, 
		{
			Header: "Status",
			accessor: "status",
			filterAll: false,
			className: classes.center,
			Cell: row => statusTooltip(row.value)
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
