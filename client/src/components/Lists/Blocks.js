/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Button from 'reactstrap/lib/Button';
import Input from 'reactstrap/lib/Input';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import FontAwesome from 'react-fontawesome';
import find from 'lodash/find';
import last from 'lodash/last';
import { isNull } from 'util';
import ReactTable from '../Styled/Table';
import BlockView from '../View/BlockView';
import TransactionView from '../View/TransactionView';
import DatePicker from '../Styled/DatePicker';
import {
	blockListType,
} from '../types';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		hash: {
			'&, & li, & ul': {
				overflow: 'visible !important'
			}
		},
		partialHash: {
			textAlign: 'center',
			position: 'relative !important',
			'&:hover $fullHash': {
				display: 'block',
				position: 'absolute !important',
				padding: '4px 4px',
				backgroundColor: dark ? '#5e558e' : '#000000',
				marginTop: -30,
				marginLeft: -215,
				borderRadius: 8,
				color: '#ffffff',
				opacity: dark ? 1 : undefined
			},
			'&:hover $lastFullHash': {
				display: 'block',
				position: 'absolute !important',
				padding: '4px 4px',
				backgroundColor: dark ? '#5e558e' : '#000000',
				marginTop: -30,
				marginLeft: -415,
				borderRadius: 8,
				color: '#ffffff',
				opacity: dark ? 1 : undefined
			}
		},
		fullHash: {
			display: 'none'
		},
		lastFullHash: {
			display: 'none'
		},
		filter: {
			width: '100%',
			textAlign: 'center',
			margin: '0px !important'
		},
		filterButton: {
			opacity: 0.8,
			margin: 'auto',
			width: '100% !important',
			'margin-bottom': '4px'
		},
		searchButton: {
			opacity: 0.8,
			margin: 'auto',
			width: '100% !important',
			backgroundColor: dark ? undefined : '#086108',
			'margin-bottom': '4px'
		},
		filterElement: {
			textAlign: 'center',
			display: 'flex',
			padding: '0px !important',
			'& > div': {
				width: '100% !important',
				marginTop: 20
			},
			'& .label': {
				margin: '25px 10px 0px 10px'
			}
		}
	};
};

export class Blocks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
			dialogOpenBlockHash: false,
			blockHash: {},
			searchBlockHeight: null,
			page: 0,
			pages: [null],
		};
		this.searchBlockHeightRef = null;
	}

	componentWillReceiveProps({ nextAfter }) {
		const { pages } = this.state;
		if (last(pages) < nextAfter) {
			this.setState({ pages: [...pages, nextAfter] });
		}
	}

	handleDialogOpen = async (tid) => {
		this.setState({ dialogOpen: true, transaction: tid });
	};

	handleDialogClose = () => {
		this.setState({ dialogOpen: false });
	};

	handleDialogOpenBlockHash = (blockHash) => {
		const { blockList } = this.props;
		const data = find(blockList, item => item.blockhash === blockHash);

		this.setState({
			dialogOpenBlockHash: true,
			blockHash: data,
		});
	};

	openBlockByHeight(height) {
		this.setState({
			dialogOpenBlockHash: true,
			blockHash: { height },
		});
	}

	handleDialogCloseBlockHash = () => {
		this.setState({ dialogOpenBlockHash: false });
	};

	searchBlockHeightOnChange(value) {
		const { totalBlockCount } = this.props;
		this.setState({ searchBlockHeight: isNaN(value) ? null : Math.max(1, totalBlockCount !== null && value > totalBlockCount ? totalBlockCount : value) | 0 });
		if (isNaN(value) && this.searchBlockHeightRef) {
			this.searchBlockHeightRef.setAttribute('value', '');
		}
	}

	refetch(variables, state) {
		this.setState(state);
		this.props.refetch(variables);
	}
	
	pageToAfter = (page, pageSize) => this.wholePaging ? page * pageSize : this.state.pages[page];

	onPageSizeChange = (pageSize, page) => {
		if (this.wholePaging) {
			this.refetch({ after: this.pageToAfter(page, pageSize), pageSize }, { page });
		} else {
			this.refetch({ after: null, pageSize }, { page: 0, pages: [null] });
		}
	};

	onPageChange = (page) => {
		this.refetch({ after: this.pageToAfter(page, this.props.pageSize) }, { page });
	};

	timeRangeOnChange = key => (value) => {
		this.refetch({ after: null, [key]: value }, { page: 0, pages: [null] });
	};

	get wholePaging() {
		return this.props.timeAfter === null && this.props.timeBefore === null;
	}

	reactTableSetup = classes => [
		{
			Header: 'Height',
			accessor: 'blocknum',
			width: 80,
		},
		{
			Header: 'Hash',
			accessor: 'blockhash',
			className: classes.hash,
			Cell: row => (
				<span>
					<a
						data-command="block-partial-hash"
						className={classes.partialHash}
						onClick={() => this.handleDialogOpenBlockHash(row.value)}
						href="#/blocks"
					>
						<div className={classes.fullHash} id="showTransactionId">
							{row.value}
						</div>
						{' '}
						{row.value.slice(0, 6)}
						{' '}
						{!row.value ? '' : '... '}
					</a>
					{' '}
				</span>
			),
		},
		{
			Header: 'Transactions',
			accessor: 'txhash',
			className: classes.hash,
			Cell: row => (
				<ul>
					{!isNull(row.value)
						? row.value.map(tid => (
							<li
								key={tid}
								style={{
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
								}}
							>
								<a
									className={classes.partialHash}
									onClick={() => this.handleDialogOpen(tid)}
									href="#/blocks"
								>
									<div
										className={classes.lastFullHash}
										id="showTransactionId"
									>
										{tid}
									</div>
									{' '}
									{tid.slice(0, 6)}
									{' '}
									{!tid ? '' : '... '}
								</a>
							</li>
						))
						: 'null'}
				</ul>
			),
		},
	];

	render() {
		const {
			blockList, classes, totalBlockCount,
			pageSize, loading,
			timeAfter, timeBefore,
		} = this.props;
		const {
			transaction, blockHash, dialogOpen, dialogOpenBlockHash, searchBlockHeight,
			page,
			pages,
		} = this.state;
		return (
			<div>
				<div className="row searchRow">
					<div className="col-md-4">
						<InputGroup>
							<Input
								type="number"
								placeholder="Height"
								value={searchBlockHeight === null ? '' : searchBlockHeight}
								onChange={e => this.searchBlockHeightOnChange(e.target.valueAsNumber)}
								innerRef={e => this.searchBlockHeightRef = e}
							/>
							{totalBlockCount !== null && searchBlockHeight !== null && <InputGroupAddon addonType="append">
								<Button
									className={classes.searchButton}
									color="success"
									onClick={() => this.openBlockByHeight(searchBlockHeight)}
								>
									<FontAwesome name="external-link" />
								</Button>
							</InputGroupAddon>}
						</InputGroup>
					</div>
					<div className="col-md-4">
						<DatePicker
							placeholderText="From"
							selected={timeAfter}
							showTimeSelect
							timeIntervals={5}
							dateFormat="LLL"
							onChange={this.timeRangeOnChange('timeAfter')}
							maxDate={timeBefore}
						/>
					</div>
					<div className="col-md-4">
						<DatePicker
							placeholderText="To"
							selected={timeBefore}
							showTimeSelect
							timeIntervals={5}
							dateFormat="LLL"
							onChange={this.timeRangeOnChange('timeBefore')}
							minDate={timeAfter}
						/>
					</div>
				</div>
				<ReactTable
					data={blockList}
					columns={this.reactTableSetup(classes)}
					list
					sortable={false}
					minRows={0}
					style={{ height: '750px' }}

					manual
					loading={loading}
					page={page}
					pageSize={pageSize}
					onPageChange={this.onPageChange}
					onPageSizeChange={this.onPageSizeChange}
					pages={this.wholePaging ? totalBlockCount !== null ? Math.ceil(totalBlockCount / pageSize) : 1 : pages.length}
				/>

				<Dialog
					open={dialogOpen}
					onClose={this.handleDialogClose}
					fullWidth
					maxWidth="md"
				>
					<TransactionView
						transaction={transaction}
						onClose={this.handleDialogClose}
					/>
				</Dialog>

				<Dialog
					open={dialogOpenBlockHash}
					onClose={this.handleDialogCloseBlockHash}
					fullWidth
					maxWidth="md"
				>
					<BlockView
						blockHash={blockHash}
						onClose={this.handleDialogCloseBlockHash}
					/>
				</Dialog>
			</div>
		);
	}
}

Blocks.propTypes = {
	blockList: blockListType.isRequired,
};

export default compose(
	withStyles(styles),
	graphql(
		gql`query ($pageSize: Int!, $after: Int, $timeAfter: String, $timeBefore: String) {
			list: blockList(count: $pageSize, after: $after, timeAfter: $timeAfter, timeBefore: $timeBefore) {
				items {
					height
					hash
					previousBlockHash
					transactionCount
					transactions {
						hash
					}
				}
				nextAfter
			}
			total: blockCount
		}`,
		{
			options: {
				variables: {
					pageSize: 10,
					timeAfter: null,
					timeBefore: null,
				},
			},
			props({ data: { list, total, loading, refetch, variables: { pageSize, timeAfter, timeBefore } } }) {
				return {
					blockList: list ? list.items.map(({ height, hash, previousBlockHash, transactionCount, transactions }) => ({
						height,
						blocknum: height,
						txcount: transactionCount,
						blockhash: hash,
						prehash: previousBlockHash,
						txhash: transactions.map(x => x.hash),
					})) : [],
					nextAfter: list ? list.nextAfter : null,
					totalBlockCount: total === undefined ? null : total,
					pageSize,
					timeAfter,
					timeBefore,
					loading,
					refetch,
				};
			},
		},
	),
)(Blocks);
