/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './static/css/reset.css';
import { Provider } from 'react-redux';
import createStore from './store/index';
import { getChannelList } from './store/actions/chanelList/action-creators';
import { getChannel } from './store/actions/channel/action-creators';
import './static/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
const store = createStore();
store.dispatch(getChannel());
store.dispatch(getChannelList());

ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>, document.getElementById('root')
);
registerServiceWorker();