/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import operations from './operations';
import types from './types';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
const initialState = {};

describe('Auth', () => {
	describe('Operations', () => {
		afterEach(() => {
			nock.cleanAll();
		});

		test('post login', async done => {
			const userData = {
				user: 'test@test.com',
				password: '123456',
				network: 'network'
			};
			const userData2 = {
				user: 'test@test.com',
				password: '123456'
			};
			const network = 'network';
			nock(/\w*(\W)/g)
				.matchHeader('Authorization', /Bearer.*/)
				.post(`/auth/login`, { userData })
				.reply(200);

			const expectedActions = [{ type: types.LOGIN }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.login(userData2, network));
			done();
		});

		test('Register', async done => {
			nock(/\w*(\W)/g)
				.post(`/auth/REGISTER`)
				.reply(200);

			const expectedActions = [{ type: types.REGISTER }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.register());
			done();
		});

		test('NetworkList', async done => {
			nock(/\w*(\W)/g)
				.post(`/auth/networklist`)
				.reply(200);

			const expectedActions = [{ type: types.NETWORK }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.register());
			done();
		});
	});
});
