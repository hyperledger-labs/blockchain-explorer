/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactSelect from 'react-select';
import 'react-select/dist/react-select.css';
import classnames from 'classnames';

const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		select: {
			'& .Select-control': {
				backgroundColor: `${dark ? '#6a628e' : '#e8e8e8'} !important`,
				color: dark ? '#ffffff !important' : undefined
			},
			'& .Select-control .Select-clear-zone': {
				display: 'none',
				width: '95% !important',
				margin: 'auto'
			},
			'& .Select-control .Select-value': {
				paddingRight: '22px !important'
			},
			'& .Select-menu-outer': {
				background: dark ? '#5a5379 !important' : undefined,
				color: dark ? '#ffffff !important' : undefined
			},
			'& .Select-option': {
				background: dark ? '#453e68 !important' : undefined,
				color: dark ? '#cfcdcd !important' : undefined
			},
			'& .Select-option.is-selected': {
				background: dark ? '#6a628e !important' : undefined,
				color: dark ? '#ffffff !important' : undefined
			},
			'& .Select-option.is-focused': {
				background: dark ? '#5d5291 !important' : undefined,
				color: dark ? '#ffffff !important' : undefined
			},
			'& .Select-value-label': {
				color: dark ? '#000000 !important' : undefined
			}
		},
		filter: {
			[`
        & .Select-control,
        & .Select-menu-outer,
        & .Select-option,
        & .Select-option.is-selected,
        & .Select-option.is-focused
      `]: {
				background: dark ? '#7165ae !important' : undefined,
				color: dark ? '#ffffff !important' : undefined
			}
		}
	};
};

const Select = props => {
	const { className = '', classes, filter, ...rest } = props;
	const clazz = classnames(classes.select, filter && classes.filter, className);
	return <ReactSelect className={clazz} {...rest} />;
};

export default withStyles(styles)(Select);
