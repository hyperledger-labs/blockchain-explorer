/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { blockbyBlockHashType, onCloseType } from '../types';
import Modal from '../Styled/Modal';

const styles = theme => ({
	cubeIcon: {
		color: '#ffffff',
		marginRight: 20
	}
});

export class BlockHashView extends Component {
	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	render() {
		const { blockByBlockHash, classes } = this.props;
		if (!blockByBlockHash) {
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
											<td>{blockByBlockHash.channelname}</td>
										</tr>
										<tr>
											<th>Block Number</th>
											<td>{blockByBlockHash.blocknum}</td>
										</tr>
										<tr>
											<th>Created at</th>
											<td>{blockByBlockHash.createdt}</td>
										</tr>

										<tr>
											<th>Number of Transactions</th>
											<td>{blockByBlockHash.txcount}</td>
										</tr>
										<tr>
											<th>Block Hash</th>
											<td>
												{blockByBlockHash.blockhash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByBlockHash.blockhash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Data Hash</th>
											<td>
												{blockByBlockHash.datahash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByBlockHash.datahash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Prehash</th>
											<td>
												{blockByBlockHash.prehash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockByBlockHash.prehash}>
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

BlockHashView.propTypes = {
	blockByBlockHash: blockbyBlockHashType.isRequired,
	onClose: onCloseType.isRequired
};

export default withStyles(styles)(BlockHashView);
