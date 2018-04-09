/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import '../../static/css/main.css';
import Main from '../Main';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';
import lightBlue from 'material-ui/colors/lightBlue';
import red from 'material-ui/colors/red';
import HeaderView from '../Header/HeaderView';
import LandingPage from '../View/LandingPage';
const muiTheme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    tonalOffset: 0.2,
    primary: indigo,
    secondary: lightBlue,
    error: {
      main: red[500],
    },
  },
});


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true }
  }
  componentWillMount() {
    setTimeout(() => this.setState({ loading: false }), 6000);
  }
  componentDidMount() {

  }
  render() {
    if (this.state.loading) {
      return (
        <LandingPage />
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme} >
        <div>
          <HeaderView />
          <Main />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
