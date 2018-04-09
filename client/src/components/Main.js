/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './Layout/index';

const Main = () =>
  (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path='/' component={Layout} />
          </Switch>
        </div>
      </Router>
  )

export default Main
