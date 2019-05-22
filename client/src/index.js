/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStore from './state/store';
import authOperations from './state/redux/auth/operations';
import Theme from './components/Theme';
import App from './components/App';
import { unregister } from './registerServiceWorker';

const mode = localStorage.getItem('theme-mode') || 'light';
const store = createStore({ theme: { mode } });

store.subscribe(themeSideEffect(store));

function themeSideEffect(store) {
	let theme;
	return () => {
		const state = store.getState();
		if (theme !== state.theme) {
			theme = state.theme;
			localStorage.setItem('theme-mode', theme.mode);
		}
	};
}

store.dispatch(authOperations.network());

unregister();

ReactDOM.render(
	<Provider store={store}>
		<Theme>
			<App />
		</Theme>
	</Provider>,
	document.getElementById('root')
);
