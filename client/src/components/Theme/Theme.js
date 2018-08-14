/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import indigo from '@material-ui/core/colors/indigo';
import lightBlue from '@material-ui/core/colors/lightBlue';
import red from '@material-ui/core/colors/red';
import { themeSelectors } from '../../state/redux/theme';
import '../../static/css/main.css';
import '../../static/css/main-dark.css';
import '../../static/css/media-queries.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'font-awesome/css/font-awesome.min.css';

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
      palette: {
        contrastThreshold: 3,
        tonalOffset: 0.2,
        background: { paper: mode === 'dark' ? '#453e68' : '#ffffff' },
        primary: { ...indigo, dark: '#242036' },
        secondary: lightBlue,
        error: {
          main: red[500]
        },
        toggleClass: true,
        type: mode
      }
    });
  }
}

const { modeSelector } = themeSelectors;

export default connect(state => ({
  mode: modeSelector(state)
}))(Theme);
