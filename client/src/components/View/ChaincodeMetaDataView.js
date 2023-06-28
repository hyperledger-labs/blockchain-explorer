/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import JSONTree from 'react-json-tree';
import { chaincodeMetaDataType } from '../types';
import Modal from '../Styled/Modal';
/* eslint-disable */
const readTheme = {
	base00: '#f3f3f3',
	base01: '#2e2f30',
	base02: '#515253',
	base03: '#737475',
	base04: '#959697',
	base05: '#b7b8b9',
	base06: '#dadbdc',
	base07: '#fcfdfe',
	base08: '#e31a1c',
	base09: '#e6550d',
	base0A: '#dca060',
	base0B: '#31a354',
	base0C: '#80b1d3',
	base0D: '#3182bd',
	base0E: '#756bb1',
	base0F: '#b15928'
};
const writeTheme = {
	...readTheme,
	base00: '#ffffff'
};
/* eslint-enable */
const styles = theme => ({
	listIcon: {
		color: '#ffffff',
		marginRight: 20
	},
	JSONtree: {
		'& ul': {
			backgroundColor: 'transparent !important',
			color: '#fff'
		}
	}
});

const reads = {
	color: '#2AA233'
};
const writes = {
	color: '#DD8016'
};

export class ChaincodeMetaDataView extends Component {
	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	render() {
		const { chaincodeMetaData, classes } = this.props;
		if (!chaincodeMetaData) {
			return (
				<Modal>
					{modalClasses => (
						<div>
							<CardTitle className={modalClasses.title}>
								<FontAwesome name="list-alt" className={classes.listIcon} />
								Chaincode Details
								<button
									type="button"
									onClick={this.handleClose}
									className={modalClasses.closeBtn}
								>
									<FontAwesome name="close" />
								</button>
							</CardTitle>
							<div align="center">
								<CardBody className={modalClasses.body}>
									<span>
										{' '}
										<FontAwesome name="circle-o-notch" size="3x" spin />
									</span>
								</CardBody>
							</div>
						</div>
					)}
				</Modal>
			);
		}
		return (
			<Modal>
				{modalClasses => (
					<div className={modalClasses.dialog}>
						<Card className={modalClasses.card}>
							<CardTitle className={modalClasses.title}>
								<FontAwesome name="list-alt" className={classes.listIcon} />
								Chaincode Details
								<button
									type="button"
									onClick={this.handleClose}
									className={modalClasses.closeBtn}
								>
									<FontAwesome name="close" />
								</button>
							</CardTitle>
							<CardBody className={modalClasses.body}>
								<Table striped hover responsive className="table-striped">
									<tbody>
										<tr>
											<th style={reads}>Info:</th>
											<td className={classes.JSONtree}>
												<JSONTree
													data={chaincodeMetaData.info}
													theme={readTheme}
													invertTheme={false}
												/>
											</td>
										</tr>
										<tr>
											<th style={writes}>Contracts:</th>
											<td className={classes.JSONtree}>
												<JSONTree
													data={chaincodeMetaData.contracts}
													theme={writeTheme}
													invertTheme={false}
												/>
											</td>
										</tr>
										<tr>
											<th style={reads}>Components:</th>
											<td className={classes.JSONtree}>
												<JSONTree
													data={chaincodeMetaData.components}
													theme={readTheme}
													invertTheme={false}
												/>
											</td>
										</tr>
									</tbody>
								</Table>
							</CardBody>
						</Card>
					</div>
				)}
			</Modal>
		);
	}
}

ChaincodeMetaDataView.propTypes = {
	chaincodeMetaData: chaincodeMetaDataType
};


export default withStyles(styles)(ChaincodeMetaDataView);
