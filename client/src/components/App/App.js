/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import lightBlue from '@material-ui/core/colors/lightBlue';
import red from '@material-ui/core/colors/red';
import Main from '../Main';
import HeaderView from '../Header/HeaderView';
import FooterView from '../Header/footerView';
import LandingPage from '../View/LandingPage';
import '../../static/css/main.css';
import '../../static/css/main-dark.css';
import '../../static/css/media-queries.css';
import ErrorMesageComponent from '../errorMesageComponent';
import { chartSelectors } from '../../state/redux/charts';
const { errorMessageSelector } = chartSelectors;

const muiTheme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    tonalOffset: 0.2,
    primary: indigo,
    secondary: lightBlue,
    error: {
      main: red[500]
    },
    toggleClass: true
  }
});

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  componentWillMount() {
    // Check if sessionStorage is true, then theme is true, else false.
    const theme = sessionStorage.getItem('toggleTheme') === 'true';
    this.setState({ toggleClass: theme }, () => {
      theme
        ? (document.body.className = 'dark-theme')
        : (document.body.className = '');
    });
  }

  updateLoadStatus = () => {
    this.setState({ loading: false });
  };

  refreshComponent = val => {
    this.setState({ toggleClass: val }, () => {
      const { toggleClass } = this.state;
      toggleClass
        ? (document.body.className = 'dark-theme')
        : (document.body.className = '');
    });
  };

  render() {
    const { loading } = this.state;
    if (loading) {
      return <LandingPage updateLoadStatus={this.updateLoadStatus} />;
    }

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <HeaderView refresh={this.refreshComponent} />
          {this.props.error && (
            <ErrorMesageComponent message={this.props.error} />
          )}
          <Main />
          <div className="footerView">
            <FooterView />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
export default connect(state => ({
  error: errorMessageSelector(state)
}))(App);
