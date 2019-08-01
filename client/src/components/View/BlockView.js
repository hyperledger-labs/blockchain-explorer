/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Table from 'reactstrap/lib/Table';
import Card from 'reactstrap/lib/Card';
import CardBody from 'reactstrap/lib/CardBody';
import CardTitle from 'reactstrap/lib/CardTitle';
import TransactionView from './TransactionView';
import { onCloseType } from '../types';
import Modal from '../Styled/Modal';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const styles = theme => ({
	cubeIcon: {
		color: '#ffffff',
		marginRight: 20
	}
});

export class BlockView extends Component {
	state = {
		showTransaction: null,
	};

	handleClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	render() {
		const { showTransaction } = this.state;
		const { blockHash, classes } = this.props;
		if (!blockHash) {
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
											<th>Block Number</th>
											<td>{blockHash.blocknum}</td>
										</tr>
										<tr>
											<th>Created at</th>
											<td>{blockHash.createdt}</td>
										</tr>

										<tr>
											<th>Number of Transactions</th>
											<td>{blockHash.txcount}</td>
										</tr>
										<tr>
											<th>Block Hash</th>
											<td>
												{blockHash.blockhash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockHash.blockhash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Data Hash</th>
											<td>
												{blockHash.datahash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockHash.datahash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Prehash</th>
											<td>
												{blockHash.prehash}
												<button type="button" className={modalClasses.copyBtn}>
													<div className={modalClasses.copy}>Copy</div>
													<div className={modalClasses.copied}>Copied</div>
													<CopyToClipboard text={blockHash.prehash}>
														<FontAwesome name="copy" />
													</CopyToClipboard>
												</button>
											</td>
										</tr>
										<tr>
											<th>Transactions</th>
											<td>
												{blockHash.transactions.length ? blockHash.transactions.map(({ hash }, i) =>
													<div key={i} onClick={() => this.setState({ showTransaction: hash })}>{hash}</div>
												) : '-'}
											</td>
										</tr>
									</tbody>
								</Table>
							</CardBody>
						</Card>
						
						<Dialog
							open={showTransaction !== null}
							onClose={() => this.setState({ showTransaction: null })}
							fullWidth
							maxWidth="md"
						>
							{showTransaction ? <TransactionView
								transaction={showTransaction}
								onClose={() => this.setState({ showTransaction: null })}
							/> : ''}
						</Dialog>
					</div>
				)}
			</Modal>
		);
	}
}

BlockView.propTypes = {
	onClose: onCloseType.isRequired
};

export default compose(
	withStyles(styles),
	graphql(
		gql`query ($height: Int!) {
			block: blockByHeight(height: $height) {
				blocknum: height
				datahash: hash
				blockhash: hash
				prehash: previousBlockHash
				txcount: transactionCount
				createdt: time
				transactions {
					hash
				}
			}
		}`,
		{
			options(props) {
				return {
					variables: {
						height: props.blockHash.height
					}
				}
			},
			props({ data: { block } }) {
				return {
					blockHash: block,
				};
			},
		}
	),
)(BlockView);
