/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { themeSelectors } from '../../state/redux/theme';
import '../../static/css/main.css';
import '../../static/css/main-dark.css';
import '../../static/css/media-queries.css';
import '../../static/css/fonts.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'font-awesome/css/font-awesome.min.css';
import 'reactflow/dist/style.css';

class Theme extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true
		};
	}

	render() {
		const { mode, children } = this.props;
		return (
			<MuiThemeProvider theme={this.getTheme(mode)}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		);
	}

	getTheme(mode) {
		return createMuiTheme({
			typography: {
				caption: {
					color: 'rgba(0, 0, 0, 0.6)'
				}
			},
			palette: {
				primary: {
					main: 'rgba(24, 32, 97, 1)'
				},
				background: {
					default: 'rgba(250, 250, 250, 1)'
				},
				text: {
					primary: 'rgba(25, 25, 25, 1)',
					secondary: 'rgba(66, 66, 66, 1)'
				},
				action: {
					active: 'rgba(0, 0, 0, 0.54)'
				}
			}
		});
	}
}

const { modeSelector } = themeSelectors;

export default connect(state => ({
	mode: modeSelector(state)
}))(Theme);
