/**
 *    SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */

import React from 'react';

import { Route, Redirect } from 'react-router-dom';

import { connect } from 'react-redux';

import { authSelectors } from '../../state/redux/auth';

export function Private({ render, auth, ...rest }) {
	const redirect = !auth;
	return (
		<Route
			{...rest}
			render={props =>
				!redirect ? (
					render(props)
				) : (
					<Redirect
						to={{
							pathname: '/login',
							state: { from: props.location }
						}}
					/>
				)
			}
		/>
	);
}

const { authSelector } = authSelectors;

export default connect(state => ({
	auth: authSelector(state)
}))(Private);
