/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import operations from './operations';
import types from './types';
import reducers from './reducers';
import * as selectors from './selectors';
import * as actions from './actions';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
const initialState = {};

describe('Reducers', () => {
	it('should return the initial state', () => {
		expect(reducers(undefined, {})).toEqual({
			user: '',
			token: null,
			error: '',
			networks: [],
			registered: ''
		});
	});

	test('Login', () => {
		const payload = { user: 'Test' };
		const action = actions.login(payload);

		const newState = reducers(initialState, action);
		expect(newState.user).toBe('Test');
	});

	test('Error', () => {
		const payload = { error: 'Test' };
		const action = actions.error(payload);

		const newState = reducers(initialState, action);
		expect(newState.error).toBe('Test');
	});

	test('Network', () => {
		const payload = { network: 'Test' };
		const action = actions.network(payload);

		const newState = reducers(initialState, action);
		expect(newState.network).toBe('Test');
	});

	test('Register', () => {
		const payload = { register: 'Test' };
		const action = actions.register(payload);

		const newState = reducers(initialState, action);
		expect(newState.register).toBe('Test');
	});
});

describe('Selectors', () => {
	test('Auth Selector', () => {
		const state = { auth: { token: 'test' } };
		const AuthSelector = selectors.authSelector(state);
		expect(AuthSelector).toBe('test');
	});

	test('Error Selector', () => {
		const state = { auth: { error: 'test' } };
		const ErrorSelector = selectors.errorSelector(state);
		expect(ErrorSelector).toBe('test');
	});

	test('Network Selector', () => {
		const state = { auth: { networks: 'test' } };
		const NetworkSelector = selectors.networkSelector(state);
		expect(NetworkSelector).toBe('test');
	});

	test('Registered Selector', () => {
		const state = { auth: { registered: 'test' } };
		const RegisteredSelector = selectors.registeredSelector(state);
		expect(RegisteredSelector).toBe('test');
	});
});

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
				.get(`/auth/networklist`)
				.reply(200);

			const expectedActions = [{ type: types.NETWORK }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.network());
			done();
		});
	});
});
