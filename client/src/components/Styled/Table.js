/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import classnames from 'classnames';
import matchSorter from 'match-sorter';

/* istanbul ignore next */
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		'.rt-noData': {
			color: '#ffffff !important',
			background: '#7165ae !important'
		},
		table: {
			'& .rt-tbody': {
				overflow: 'scroll !important'
			},
			'& .rt-th input': {
				background: dark ? '#7165ad !important' : undefined,
				color: dark ? '#ffffff' : undefined
			}
		},
		list: {
			'& ::-webkit-scrollbar': {
				width: '1em'
			},
			'& ::-webkit-scrollbar-track': {
				background: dark ? '#443e68' : 'rgb(238, 237, 237)'
			},
			'& ::-webkit-scrollbar-thumb': {
				background: dark ? '#6a5e9e' : 'rgb(192, 190, 190)'
			},
			'& ::-webkit-scrollbar-corner': {
				background: dark ? '#443e68' : 'rgb(238, 237, 237)'
			}
		},
		pagination: {
			'& button': {
				color: dark ? '#ffffff !important' : undefined,
				backgroundColor: dark ? '#5d538e !important' : undefined,
			},
			'& button:hover': {
				color: dark ? '#39c9f5 !important' : undefined,
				backgroundColor: dark ? '#7165ad !important' : undefined,
			},
		},
	};
};

const Table = (props) => {
	const {
		className = '', list = false, classes,
		data,
		defaultPageSize,
		...rest
	} = props;
	const clazz = classnames(
		classes.table,
		'-striped -highlight',
		className,
		list && classes.list
	);
	return (
		<ReactTable
			className={clazz}
			{...rest}
			data={data}
			{...defaultPageSize && {
				defaultPageSize,
				showPagination: data.length >= defaultPageSize,
			}}
			getPaginationProps={() => ({ className: classes.pagination })}
		/>
	);
};

export const filteredColumn = (original) => ({
	...original,
	filterMethod: (filter, rows) => matchSorter(
		rows,
		filter.value,
		{ keys: [original.accessor] },
		{ threshold: matchSorter.rankings.SIMPLEMATCH },
	),
	filterAll: true,
});

export default withStyles(styles)(Table);
