/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import actions from './actions';
import operations from './operations';
import reducers from './reducers';
import * as selectors from './selectors';
import types from './types';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
const initialState = {};

describe('Tables', () => {
	describe('Operations', () => {
		afterEach(() => {
			nock.cleanAll();
		});

		const channel = 'mychannel';
		const query = 'query';

		test('blockList', () => {
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockList(channel)).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.BLOCK_LIST);
			});
		});

		test('blockList catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockList(channel)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('blockListSearch', () => {
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0?${query}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			return store
				.dispatch(operations.blockListSearch(channel, query))
				.then(() => {
					const action = store.getActions();
					expect(action[0].type).toEqual(types.BLOCK_LIST_SEARCH);
				});
		});

		test('blockListSearch catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0?${query}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			return store
				.dispatch(operations.blockListSearch(channel, query))
				.then(() => {
					const action = store.getActions();
					expect(action).toEqual([]);
				});
		});

		test('chaincodeList', () => {
			nock(/\w*(\W)/g)
				.get(`/api/chaincode/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHAINCODE_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.chaincodeList(channel)).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.CHAINCODE_LIST);
			});
		});

		test('chaincodeList catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/chaincode/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHAINCODE_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.chaincodeList(channel)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('channels', () => {
			nock(/\w*(\W)/g)
				.get('/api/channels/info')
				.reply(200, {
					channels: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHANNELS }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channels()).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.CHANNELS);
			});
		});

		test('channels catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get('/api/channels/info')
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHANNELS }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channels(channel)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('peerList', () => {
			nock(/\w*(\W)/g)
				.get(`/api/peersStatus/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.PEER_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.peerList(channel)).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.PEER_LIST);
			});
		});

		test('peerList catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/peersStatus/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.PEER_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.peerList(channel)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('transaction', () => {
			nock(/\w*(\W)/g)
				.get(`/api/transaction/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transaction(channel, 1)).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.TRANSACTION);
			});
		});

		test('transaction catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/transaction/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transaction(channel, 1)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('transactionList', () => {
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0/`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionList(channel)).then(() => {
				const action = store.getActions();
				expect(action[0].type).toEqual(types.TRANSACTION_LIST);
			});
		});

		test('transactionList catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0/`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionList(channel)).then(() => {
				const action = store.getActions();
				expect(action).toEqual([]);
			});
		});

		test('transactionListSearch', () => {
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0?${query}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			return store
				.dispatch(operations.transactionListSearch(channel, query))
				.then(() => {
					const action = store.getActions();
					expect(action[0].type).toEqual(types.TRANSACTION_LIST_SEARCH);
				});
		});

		test('transactionListSearch catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0?${query}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			return store
				.dispatch(operations.transactionListSearch(channel, query))
				.then(() => {
					const action = store.getActions();
					expect(action).toEqual([]);
				});
		});
	});

	describe('Reducers', () => {
		test('blockListReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getBlockList(payload);

			const newState = reducers(initialState, action);
			expect(newState.blockList.rows).toBe('test');
		});

		test('chaincodeListReducer', () => {
			const payload = { chaincode: 'test' };
			const action = actions.getChaincodeList(payload);

			const newState = reducers(initialState, action);
			expect(newState.chaincodeList.rows).toBe('test');
		});

		test('channelsReducer', () => {
			const payload = { channels: 'test' };
			const action = actions.getChannels(payload);

			const newState = reducers(initialState, action);
			expect(newState.channels.rows).toBe('test');
		});

		test('peerListReducer', () => {
			const payload = { peers: 'test' };
			const action = actions.getPeerList(payload);

			const newState = reducers(initialState, action);
			expect(newState.peerList.rows).toBe('test');
		});

		test('transactionReducer', () => {
			const payload = { row: 'test' };
			const action = actions.getTransaction(payload);

			const newState = reducers(initialState, action);
			expect(newState.transaction.transaction).toBe('test');
		});

		test('transactionListReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getTransactionList(payload);

			const newState = reducers(initialState, action);
			expect(newState.transactionList.rows).toBe('test');
		});

		test('blockListSearchReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getBlockListSearch(payload);

			const newState = reducers(initialState, action);
			expect(newState.blockListSearch.rows).toBe('test');
		});

		test('transactionListSearchReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getTransactionListSearch(payload);

			const newState = reducers(initialState, action);
			expect(newState.transactionListSearch.rows).toBe('test');
		});
	});

	describe('selectors', () => {
		test('blockListSelector', () => {
			const state = { tables: { blockList: { rows: 'test' } } };
			const blockList = selectors.blockListSelector(state);
			expect(blockList).toBe('test');
		});

		test('chaincodeListSelector', () => {
			const state = { tables: { chaincodeList: { rows: 'test' } } };
			const chaincodeList = selectors.chaincodeListSelector(state);
			expect(chaincodeList).toBe('test');
		});

		test('channelsSelector', () => {
			const state = { tables: { channels: { rows: 'test' } } };
			const channels = selectors.channelsSelector(state);
			expect(channels).toBe('test');
		});

		test('peerListSelector', () => {
			const state = { tables: { peerList: { rows: 'test' } } };
			const peerList = selectors.peerListSelector(state);
			expect(peerList).toBe('test');
		});

		test('transactionSelector', () => {
			const state = { tables: { transaction: { transaction: 'test' } } };
			const transaction = selectors.transactionSelector(state);
			expect(transaction).toBe('test');
		});

		test('transactionListSelector', () => {
			const state = { tables: { transactionList: { rows: 'test' } } };
			const transactionList = selectors.transactionListSelector(state);
			expect(transactionList).toBe('test');
		});

		test('transactionListSearchSelector', () => {
			const state = { tables: { transactionListSearch: { rows: 'test' } } };
			const transactionListSearch = selectors.transactionListSearchSelector(state);
			expect(transactionListSearch).toBe('test');
		});

		test('blockListSearchSelector', () => {
			const state = { tables: { blockListSearch: { rows: 'test' } } };
			const blockListSearchSelector = selectors.blockListSearchSelector(state);
			expect(blockListSearchSelector).toBe('test');
		});
	});
});
