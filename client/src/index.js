/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './static/css/reset.css';
import { Provider } from 'react-redux';
import createStore from './state/store';
// import { getChannelList } from './store/actions/chanelList/action-creators';
import chartsOperations from './state/redux/charts/operations'
// import { getChannel } from './store/actions/channel/action-creators';
import './static/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './components/App/App';
import { unregister } from './registerServiceWorker';

const store = createStore();
store.dispatch(chartsOperations.channel());
store.dispatch(chartsOperations.channelList());
unregister();
ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>, document.getElementById('root')
);
