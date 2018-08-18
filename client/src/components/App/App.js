/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import Main from '../Main';
import Header from '../Header';
import Footer from '../Footer';
import LandingPage from '../View/LandingPage';
import ErrorMesage from '../ErrorMesage';
import { chartSelectors } from '../../state/redux/charts';
import { themeSelectors, themeActions } from '../../state/redux/theme';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    app: {
      backgroundColor: dark ? 'rgb(36, 32, 54)' : 'rgb(240, 245, 249)',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      '& ol, & ul': {
        listStyle: 'none'
      }
    }
  };
};

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  updateLoadStatus = () => {
    this.setState({ loading: false });
  };

  refreshComponent = mode => {
    this.props.changeTheme(mode);
  };

  render() {
    const { loading } = this.state;
    if (loading) {
      return <LandingPage updateLoadStatus={this.updateLoadStatus} />;
    }
    const { classes, mode, error } = this.props;
    const className = classnames(mode === 'dark' && 'dark-theme', classes.app);
    return (
      <div className={className}>
        <Header refresh={this.refreshComponent} />
        {error && <ErrorMesage message={error} />}
        <Main />
        <Footer />
      </div>
    );
  }
}

const { modeSelector } = themeSelectors;
const { changeTheme } = themeActions;
const { errorMessageSelector } = chartSelectors;

export default compose(
  withStyles(styles),
  connect(
    state => ({
      error: errorMessageSelector(state),
      mode: modeSelector(state)
    }),
    { changeTheme }
  )
)(App);
