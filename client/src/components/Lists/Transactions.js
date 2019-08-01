/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Button from 'reactstrap/lib/Button';
import Input from 'reactstrap/lib/Input';
import last from 'lodash/last';
import ReactTable from '../Styled/Table';
import TransactionView from '../View/TransactionView';
import DatePicker from '../Styled/DatePicker';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		hash: {
			'&, & li': {
				overflow: 'visible !important'
			}
		},
		partialHash: {
			textAlign: 'center',
			position: 'relative !important',
			'&:hover $lastFullHash': {
				marginLeft: -400
			},
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
			}
		},
		fullHash: {
			display: 'none'
		},
		lastFullHash: {},
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

export class Transactions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
			page: 0,
			pages: [null],
			creatorId: null,
		};
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

	creatorIdOnChange(creatorId) {
		this.refetch({ after: null, creatorId }, { page: 0, pages: [null], creatorId });
	}

	get wholePaging() {
		return this.props.timeAfter === null && this.props.timeBefore === null && this.state.creatorId === null;
	}

	render() {
		const { classes } = this.props;
		const columnHeaders = [
			{
				Header: 'Creator',
				accessor: 'creator_msp_id',
			},
			{
				Header: 'Hash',
				accessor: 'txhash',
				className: classes.hash,
				Cell: row => (
					<span>
						<a
							data-command="transaction-partial-hash"
							className={classes.partialHash}
							onClick={() => this.handleDialogOpen(row.value)}
							href="#/transactions"
						>
							<div className={classes.fullHash} id="showTransactionId">
								{row.value}
							</div>
							{' '}
							{row.value.slice(0, 6)}
							{!row.value ? '' : '... '}
						</a>
					</span>
				),
			},
			{
				Header: 'Timestamp',
				accessor: 'createdt',
			},
		];

		const {
			transactionList,
			totalTransactionCount, pageSize, loading,
			timeAfter, timeBefore,
		} = this.props;
		const {
			transaction, dialogOpen,
			page,
			pages,
			creatorId,
		} = this.state;
		return (
			<div>
				<div className="row searchRow">
					<div className="col-md-3">
						<Input
							placeholder="Creator"
							value={creatorId || ''}
							onChange={e => this.creatorIdOnChange(e.target.value || null)}
						/>
					</div>
					<div className="col-md-3">
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
					<div className="col-md-3">
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
					data={transactionList}
					columns={columnHeaders}
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
					pages={this.wholePaging ? totalTransactionCount !== null ? Math.ceil(totalTransactionCount / pageSize) : 1 : pages.length}
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
			</div>
		);
	}
}

export default compose(
	withStyles(styles),
	graphql(
		gql`query ($pageSize: Int!, $after: Int, $timeAfter: String, $timeBefore: String, $creatorId: String) {
			list: transactionList(count: $pageSize, after: $after, timeAfter: $timeAfter, timeBefore: $timeBefore, creatorId: $creatorId) {
				items {
					hash
					time
					createdBy {
						id
					}
				}
				nextAfter
			}
			total: transactionCount
		}`,
		{
			options: {
				variables: {
					pageSize: 10,
					timeAfter: null,
					timeBefore: null,
					creatorId: null,
				},
			},
			props({ data: { list, total, loading, refetch, variables: { pageSize, timeAfter, timeBefore } } }) {
				return {
					transactionList: list ? list.items.map(({ hash, time, createdBy }) => ({
						txhash: hash,
						createdt: time,
						creator_msp_id: createdBy.id,
					})) : [],
					nextAfter: list ? list.nextAfter : null,
					totalTransactionCount: total === undefined ? null : total,
					pageSize,
					timeAfter,
					timeBefore,
					loading,
					refetch,
				};
			},
		},
	),
)(Transactions);
