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

		test('blockList', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.blockList(channel));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.BLOCK_LIST);

			done();
		});

		test('blockList catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.blockList(channel));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('blockListSearch', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0?${query}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.blockListSearch(channel, query));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.BLOCK_LIST_SEARCH);

			done();
		});

		test('blockListSearch catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blockAndTxList/${channel}/0?${query}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.blockListSearch(channel, query));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('chaincodeList', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/chaincode/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHAINCODE_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.chaincodeList(channel));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.CHAINCODE_LIST);

			done();
		});

		test('chaincodeList catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/chaincode/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHAINCODE_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.chaincodeList(channel));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('channels', async done => {
			nock(/\w*(\W)/g)
				.get('/api/channels/info')
				.reply(200, {
					channels: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHANNELS }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.channels());
			const action = store.getActions();
			expect(action[0].type).toEqual(types.CHANNELS);

			done();
		});

		test('channels catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get('/api/channels/info')
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHANNELS }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.channels(channel));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('peerList', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/peersStatus/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.PEER_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.peerList(channel));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.PEER_LIST);

			done();
		});

		test('peerList catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/peersStatus/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.PEER_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.peerList(channel));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('transaction', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/transaction/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transaction(channel, 1));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.TRANSACTION);

			done();
		});

		test('transaction catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/transaction/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transaction(channel, 1));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('transactionList', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0/`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transactionList(channel));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.TRANSACTION_LIST);

			done();
		});

		test('transactionList catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0/`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_LIST }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transactionList(channel));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
		});

		test('transactionListSearch', async done => {
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0?${query}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transactionListSearch(channel, query));
			const action = store.getActions();
			expect(action[0].type).toEqual(types.TRANSACTION_LIST_SEARCH);

			done();
		});

		test('transactionListSearch catch error', async done => {
			spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txList/${channel}/0/0?${query}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_LIST_SEARCH }];
			const store = mockStore(initialState, expectedActions);

			await store.dispatch(operations.transactionListSearch(channel, query));
			const action = store.getActions();
			expect(action).toEqual([]);

			done();
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
