/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './Layout/Layout';
import BlocksView from './View/BlocksView';
import Network from './View/NetworkView';
import TransactionsView from './View/TransactionsView';
import ChaincodeView from './View/ChaincodeView';
import DashboardView from './View/DashboardView';
import ChannelsView from './View/ChannelsView';

const Main = () =>
  (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" component={DashboardView} />
            <Route path = "/network" component={Network}/>
            <Route path = "/blocks" component={BlocksView}/>
            <Route path = "/transactions" component={TransactionsView}/>
            <Route path = "/chaincodes" component={ChaincodeView}/>
            <Route path = "/channels" component={ChannelsView}/>

          </Switch>
        </div>
      </Router>
  )

export default Main
