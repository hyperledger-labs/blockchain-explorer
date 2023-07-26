/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import { Button } from 'reactstrap';
import matchSorter from 'match-sorter';
import find from 'lodash/find';
import moment from 'moment';
import { isNull } from 'util';
import ReactTable from '../Styled/Table';
import BlockView from '../View/BlockView';
import TransactionView from '../View/TransactionView';
import MultiSelect from '../Styled/MultiSelect';
import DatePicker from '../Styled/DatePicker';
import SearchIcon from '@material-ui/icons/Search';
import {
	blockListSearchType,
	blockRangeSearchType,
	currentChannelType,
	getTransactionType,
	transactionType,
	getTxnListType,
	txnListType
} from '../types';
import { FormHelperText, TablePagination, TextField } from '@mui/material';
import { MenuItem, Select } from '@material-ui/core';
import {
	reg,
	rowsPerPageOptions,
	rangeLimitOptions,
	defaultRangeLimit,
	E001,
	E002,
	E003,
	E004,
	E005
} from './constants';
import { Info } from '@material-ui/icons';

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
		htinputs: {
			display: 'flex',
			marginBottom: '15px',
			position: 'relative'
		},
		errorText: {
			width: '100%',
			position: 'absolute',
			left: '0px',
			bottom: '-20px',
			cursor: 'default'
		},
		startBlock: {
			marginRight: '5px'
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
			'& .label': {
				margin: '25px 10px 0px 10px'
			}
		},
		filterDate: {
			'& > div': {
				width: '100% !important',
				marginTop: 20
			}
		},
		blockRangeRow: {
			marginBottom: '10px !important',
			marginLeft: '10px !important',
			minWidth: '25vw',
			// justifyContent: 'space-around',
			'& > div': {
				marginRight: '10px'
			},
			'& > p': {
				'white-space': 'nowrap'
			}
		},
		text: {
			alignSelf: 'center',
			marginRight: '10px',
			marginLeft: '15px'
		},
		blockrange: {
			'& > div': {
				width: '40% !important'
			}
		},
		iconButton: {
			color: '#21295c',
			alignSelf: 'center'
		}
	};
};
const tablePaginationStyle = {
	display: 'flex',
	justifyContent: 'end',
	padding: '0px 15px',
	alignItems: 'baseline',
	'.MuiToolbar-root': {
		alignItems: 'baseline'
	}
};
let timer;
export class Blocks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
			dialogOpenBlockHash: false,
			err: false,
			search: false,
			to: moment(),
			orgs: [],
			options: [],
			filtered: [],
			sorted: [],
			from: moment().subtract(1, 'days'),
			blockHash: {},
			page: 0,
			rowsPerPage: 10,
			searchClick: false,
			queryFlag: false,
			defaultQuery: true,
			startBlock: '',
			endBlock: '',
			rangeErr: '',
			brs: false,
			rangeLimit: defaultRangeLimit
		};
	}

	componentDidMount() {
		const { blockListSearch } = this.props;
		const selection = {};
		blockListSearch?.forEach(element => {
			selection[element.blocknum] = false;
		});
		const opts = [];
		this.props.transactionByOrg.forEach(val => {
			opts.push({ label: val.creator_msp_id, value: val.creator_msp_id });
		});
		this.setState({ selection, options: opts });
		this.searchBlockList();
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			this.state.search &&
			this.props.currentChannel !== prevProps.currentChannel
		) {
			if (this.interval !== undefined) {
				clearInterval(this.interval);
			}
			this.interval = setInterval(() => {
				this.searchBlockList(this.props.currentChannel);
			}, 60000);
			this.searchBlockList(this.props.currentChannel);
		}
		if (
			(!this.state.brs && prevState.page != this.state.page) ||
			prevState.rowsPerPage != this.state.rowsPerPage ||
			this.state.searchClick
		) {
			this.setState({ searchClick: false });
			this.handleSearch();
		}

		if (prevProps.blockRangeLoaded != this.props.blockRangeLoaded) {
			if (this.props.blockRangeLoaded) {
				if (typeof this.props.blockRangeSearch === 'string') {
					this.setState({ rangeErr: this.props.blockRangeSearch });
				}
			} else {
				if (this.state.rangeErr) this.setState({ rangeErr: '' });
			}
		}
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		clearTimeout(timer);
	}

	handleCustomRender(selected, options) {
		if (selected.length === 0) {
			return 'Select Orgs';
		}
		if (selected.length === options.length) {
			return 'All Orgs Selected';
		}

		return selected.join(',');
	}

	searchBlockList = async channel => {
		let pageParams = { page: this.state.page + 1, size: this.state.rowsPerPage };
		let query = '';
		if (this.state.queryFlag) {
			query = this.state.from
				? `from=${new Date(this.state.from).toString()}&to=${new Date(
						this.state.to
				  ).toString()}`
				: ``;
			for (let i = 0; i < this.state.orgs.length; i++) {
				query += `&orgs=${this.state.orgs[i]}`;
			}
			this.setState({ queryFlag: false });
		} else if (this.state.defaultQuery) {
			query = '';
			this.setState({ defaultQuery: false });
		} else {
			query = this.props.blockListSearchQuery;
		}
		let channelhash = this.props.currentChannel;
		if (channel !== undefined) {
			channelhash = channel;
		}
		await this.props.getBlockListSearch(channelhash, query, pageParams);
	};

	handleDialogOpen = async tid => {
		const { getTransaction, getTxnList, currentChannel } = this.props;
		if (this.state.brs) {
			await getTxnList(currentChannel, tid);
		} else await getTransaction(currentChannel, tid);
		this.setState({ dialogOpen: true });
	};

	handleMultiSelect = value => {
		this.setState({ orgs: value });
	};

	handleDialogClose = () => {
		this.setState({ dialogOpen: false });
	};

	handleSearch = async () => {
		if (this.interval !== undefined) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(() => {
			this.searchBlockList();
		}, 60000);
		await this.searchBlockList();
		this.setState({ search: true });
	};

	searchBlockRange = async channel => {
		let channelhash = this.props.currentChannel;
		if (channel !== undefined) {
			channelhash = channel;
		}
		await this.props.getBlockRangeSearch(
			channelhash,
			this.state.startBlock,
			this.state.endBlock
		);
	};

	handleRangeChange = e => {
		const { name, value } = e.target;
		if (reg.test(value))
			this.setState({
				[name]: value,
				rangeErr: ''
			});
	};
	handleRangeSubmit = e => {
		e.preventDefault();
		if (this.state.endBlock === '' || this.state.startBlock === '') {
			this.setState({ rangeErr: E001 });
			return;
		}
		if (Number(this.state.endBlock) < Number(this.state.startBlock)) {
			console.log('err occured');
			this.setState({
				rangeErr: E002
			});
			return;
		}
		if (this.state.endBlock - this.state.startBlock >= this.state.rangeLimit) {
			if (this.state.rangeLimit < 100) {
				this.setState({ rangeErr: E004(this.state.rangeLimit) });
			} else {
				this.setState({ rangeErr: E003 });
			}
			return;
		}
		this.searchBlockRange();
		this.setState({ search: true, brs: true, page: 0 });
	};
	handleClearSearch = () => {
		if (this.interval !== undefined) {
			clearInterval(this.interval);
		}
		this.setState({
			to: moment(),
			orgs: [],
			err: false,
			from: moment().subtract(1, 'days'),
			startBlock: '',
			endBlock: ''
		});
	};

	handleDialogOpenBlockHash = blockHash => {
		const blockList = this.state.brs
			? typeof this.props.blockRangeSearch !== 'string' &&
			  this.props.blockRangeLoaded
				? this.props.blockRangeSearch
				: []
			: this.props.blockListSearch;
		const data = find(blockList, item => item.blockhash === blockHash);

		this.setState({
			dialogOpenBlockHash: true,
			blockHash: data
		});
	};

	handleDialogCloseBlockHash = () => {
		this.setState({ dialogOpenBlockHash: false });
	};

	handleEye = (row, val) => {
		const { selection } = this.state;
		const data = Object.assign({}, selection, { [row.index]: !val });
		this.setState({ selection: data });
	};
	handlePageChange = (_e, page) => {
		this.setState({ page: page });
	};
	handleRowsChange = e => {
		this.setState({ page: 0, rowsPerPage: e.target.value });
	};

	reactTableSetup = classes => [
		{
			Header: 'Block Number',
			accessor: 'blocknum',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['blocknum'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 150
		},
		{
			Header: 'Channel Name',
			accessor: 'channelname',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['channelname'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Number of Tx',
			accessor: 'txcount',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['txcount'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 150
		},
		{
			Header: 'Data Hash',
			accessor: 'datahash',
			className: classes.hash,
			Cell: row => (
				<span>
					<ul className={classes.partialHash} href="#/blocks">
						<div className={classes.fullHash} id="showTransactionId">
							{row.value}
						</div>{' '}
						{row.value.slice(0, 6)} {!row.value ? '' : '... '}
					</ul>{' '}
				</span>
			),
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['datahash'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Block Hash',
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
						</div>{' '}
						{row.value.slice(0, 6)} {!row.value ? '' : '... '}
					</a>{' '}
				</span>
			),
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['blockhash'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Previous Hash',
			accessor: 'prehash',
			className: classes.hash,
			Cell: row => (
				<span>
					<ul
						className={classes.partialHash}
						onClick={() => this.handleDialogOpenBlockHash(row.value)}
						href="#/blocks"
					>
						<div className={classes.fullHash} id="showTransactionId">
							{row.value}
						</div>{' '}
						{row.value.slice(0, 6)} {!row.value ? '' : '... '}
					</ul>{' '}
				</span>
			),
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['prehash'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 150
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
										textOverflow: 'ellipsis'
									}}
								>
									<a
										className={classes.partialHash}
										onClick={() => this.handleDialogOpen(tid)}
										href="#/blocks"
									>
										<div className={classes.lastFullHash} id="showTransactionId">
											{tid}
										</div>{' '}
										{tid.slice(0, 6)} {!tid ? '' : '... '}
									</a>
								</li>
						  ))
						: 'null'}
				</ul>
			),
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['txhash'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true
		},
		{
			Header: 'Size(KB)',
			accessor: 'blksize',
			filterMethod: (filter, rows) =>
				matchSorter(
					rows,
					filter.value,
					{ keys: ['blksize'] },
					{ threshold: matchSorter.rankings.SIMPLEMATCH }
				),
			filterAll: true,
			width: 150
		}
	];

	render() {
		const reversedBlockRangeList =
			typeof this.props.blockRangeSearch !== 'string' &&
			this.props.blockRangeLoaded
				? this.props.blockRangeSearch
						.slice()
						.sort()
						.reverse()
				: [];
		const blockList = this.state.brs
			? reversedBlockRangeList.slice(
					this.state.page * this.state.rowsPerPage,
					(this.state.page + 1) * this.state.rowsPerPage
			  )
			: this.props.blockListSearch;
		const noOfPages = this.state.brs
			? typeof this.props.blockRangeSearch !== 'string' &&
			  this.props.blockRangeLoaded &&
			  Math.ceil(this.props.blockRangeSearch.length / this.state.rowsPerPage)
			: this.props.blockListSearchTotalPages;
		const { transaction, txnList, classes } = this.props;
		const { blockHash, dialogOpen, dialogOpenBlockHash } = this.state;
		return (
			<div>
				<div className={`${classes.filter} row searchRow`}>
					<div className={`${classes.filterElement} ${classes.filterDate} col-md-3`}>
						<label className="label">From</label>
						<DatePicker
							id="from"
							selected={this.state.from}
							showTimeSelect
							timeIntervals={5}
							maxDate={this.state.to}
							dateFormat="LLL"
							popperPlacement="bottom"
							popperModifiers={{
								flip: { behavior: ['bottom'] },
								preventOverflow: { enabled: false },
								hide: { enabled: false }
							}}
							onChange={date => {
								if (date > this.state.to) {
									this.setState({ err: true, from: date });
								} else {
									this.setState({ from: date, err: false });
								}
							}}
						/>
					</div>
					<div className={`${classes.filterElement} ${classes.filterDate} col-md-3`}>
						<label className="label">To</label>
						<DatePicker
							id="to"
							selected={this.state.to}
							showTimeSelect
							timeIntervals={5}
							dateFormat="LLL"
							minDate={this.state.from}
							popperPlacement="bottom"
							popperModifiers={{
								flip: { behavior: ['bottom'] },
								preventOverflow: { enabled: false },
								hide: { enabled: false }
							}}
							onChange={date => {
								if (date < this.state.from) {
									this.setState({ err: true, to: date });
								} else {
									this.setState({ to: date, err: false });
								}
							}}
						>
							<div className="validator ">
								{this.state.err && (
									<span className=" label border-red">
										{' '}
										From date should be less than To date
									</span>
								)}
							</div>
						</DatePicker>
					</div>
					<div className="col-md-2">
						<MultiSelect
							hasSelectAll
							valueRenderer={this.handleCustomRender}
							shouldToggleOnHover={false}
							selected={this.state.orgs}
							options={this.state.options}
							selectAllLabel="All Orgs"
							onSelectedChanged={value => {
								this.handleMultiSelect(value);
							}}
						/>
					</div>
					<div className="col-md-2">
						<Button
							className={classes.searchButton}
							color="success"
							disabled={this.state.err || !this.state.from != !this.state.to}
							onClick={() => {
								this.setState({
									page: 0,
									searchClick: true,
									queryFlag: true,
									defaultQuery: false,
									brs: false
								});
							}}
						>
							Search
						</Button>
					</div>
					<div className="col-md-1">
						<Button
							className={classes.filterButton}
							color="primary"
							onClick={() => {
								this.handleClearSearch();
							}}
						>
							Reset
						</Button>
					</div>
					<div className="col-md-1">
						<Button
							className={classes.filterButton}
							color="secondary"
							onClick={() => this.setState({ filtered: [], sorted: [] })}
						>
							Clear Filter
						</Button>
					</div>
				</div>
				<form onSubmit={this.handleRangeSubmit}>
					<div className={`${classes.filter} row searchRow`}>
						<span className={classes.text}>
							No of Blocks
							<sup title={E005} style={{ padding: '3px' }}>
								<Info style={{ fontSize: 'medium' }} />
							</sup>
						</span>
						<Select
							id="rangeLimitDropdown"
							className="rangeLimitDropdown"
							value={this.state.rangeLimit}
							onChange={e => this.setState({ rangeLimit: e.target.value })}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
							disableUnderline
						>
							{rangeLimitOptions.map(opt => (
								<MenuItem key={opt} value={opt}>
									{opt}
								</MenuItem>
							))}
						</Select>

						<div
							className={`${classes.filterElement}  ${classes.blockRangeRow}`}
							style={{ width: '50vw' }}
						>
							<div style={{ whiteSpace: 'no-wrap', alignSelf: 'center' }}>
								Block No:
							</div>
							<div className={classes.htinputs}>
								<TextField
									type="text"
									name="startBlock"
									className={classes.startBlock}
									id="startBlock"
									style={{ marginRight: '5px' }}
									value={this.state.startBlock}
									onChange={e => this.handleRangeChange(e)}
									variant="standard"
									InputLabelProps={{ shrink: true }}
									label="From"
									error={Boolean(this.state.rangeErr)}
									size="small"
								/>
								<TextField
									type="text"
									name="endBlock"
									id="endBlock"
									value={this.state.endBlock}
									onChange={e => this.handleRangeChange(e)}
									variant="standard"
									InputLabelProps={{ shrink: true }}
									label="To"
									error={Boolean(this.state.rangeErr)}
									size="small"
								/>
								<div className={`${classes.errorText}`}>
									{
										<FormHelperText
											title={this.state.rangeErr}
											style={{
												color: 'rgb(211, 47, 47)',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
											}}
										>
											{this.state.rangeErr}
										</FormHelperText>
									}
								</div>
							</div>
							<div
								id="blockRangeSearchIcon"
								className={classes.iconButton}
								type="submit"
								onClick={e => this.handleRangeSubmit(e)}
							>
								<SearchIcon />
							</div>
						</div>
					</div>
				</form>
				<ReactTable
					data={blockList || []}
					columns={this.reactTableSetup(classes)}
					pageSize={
						this.state.brs
							? this.props.blockRangeLoaded &&
							  typeof this.props.blockRangeSearch !== 'string' &&
							  this.props.blockRangeSearch.length
							: this.state.rowsPerPage
					}
					list
					filterable
					sorted={this.state.sorted}
					onSortedChange={sorted => {
						this.setState({ sorted });
					}}
					filtered={this.state.filtered}
					onFilteredChange={filtered => {
						this.setState({ filtered });
					}}
					minRows={0}
					style={{ height: '750px' }}
					showPaginationBottom={false}
				/>
				{blockList?.length > 0 && (
					<TablePagination
						page={this.state.page}
						sx={tablePaginationStyle}
						rowsPerPage={this.state.rowsPerPage}
						labelDisplayedRows={() => `Page ${this.state.page + 1} of ${noOfPages}`}
						rowsPerPageOptions={rowsPerPageOptions}
						onRowsPerPageChange={this.handleRowsChange}
						onPageChange={this.handlePageChange}
						backIconButtonProps={{
							disabled: this.state.page === 0
						}}
						nextIconButtonProps={{
							disabled: this.state.page + 1 === noOfPages
						}}
						className={classes.tablePagination}
						labelRowsPerPage={'Items per page'}
					/>
				)}

				<Dialog
					open={dialogOpen}
					onClose={this.handleDialogClose}
					fullWidth
					maxWidth="md"
				>
					<TransactionView
						transaction={this.state.brs ? txnList : transaction}
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
	blockRangeSearch: blockRangeSearchType.isRequired,
	blockListSearch: blockListSearchType.isRequired,
	currentChannel: currentChannelType.isRequired,
	getTransaction: getTransactionType.isRequired,
	transaction: transactionType,
	txnList: txnListType,
	getTxnList: getTxnListType
};

Blocks.defaultProps = {
	transaction: null,
	txnList: null
};

export default withStyles(styles)(Blocks);
