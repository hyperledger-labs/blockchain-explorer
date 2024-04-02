/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { blockbyTxIdType, onCloseType } from '../types';
import Modal from '../Styled/Modal';

const styles = theme => ({
	cubeIcon: {
		color: '#ffffff',
		marginRight: 20
	}
});

export class BlockTxIdView extends Component {
	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	render() {
		const { blockByTxId, classes } = this.props;
		if (!blockByTxId) {
			return (
				<Modal>
					{modalClasses => (
						<Card className={modalClasses.card}>
							<CardTitle className={modalClasses.title}>
								<FontAwesome name="cube" />
								Block Details
							</CardTitle>
							<CardBody className={modalClasses.body}>
								<span>
									{' '}
									<FontAwesome name="circle-o-notch" size="3x" spin />
								</span>
							</CardBody>
						</Card>
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
								<FontAwesome name="cube" className={classes.cubeIcon} />
								Block Details
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
											<th>Channel name:</th>
											<td>{blockByTxId.channelname}</td>
										</tr>
										<tr>
											<th>Block Number</th>
											<td>{blockByTxId.blocknum}</td>
										</tr>
										<tr>
											<th>Created at</th>
											<td>{blockByTxId.createdt}</td>
										</tr>

										<tr>
											<th>Number of Transactions</th>
											<td>{blockByTxId.txcount}</td>
										</tr>
										<tr>
											<th>Block Hash</th>
											<td>
												{blockByTxId.blockhash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByTxId.blockhash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Data Hash</th>
											<td>
												{blockByTxId.datahash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByTxId.datahash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Prehash</th>
											<td>
												{blockByTxId.prehash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByTxId.prehash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
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

BlockTxIdView.propTypes = {
	blockByTxId: blockbyTxIdType.isRequired,
	onClose: onCloseType.isRequired
};

export default withStyles(styles)(BlockTxIdView);
