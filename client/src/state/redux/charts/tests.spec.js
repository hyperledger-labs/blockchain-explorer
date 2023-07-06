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

describe('Charts', () => {
	describe('Operations', () => {
		afterEach(() => {
			nock.cleanAll();
		});

		const channel = 'mychannel';

		test('blockPerHour', () => {
			nock(/\w*(\W)/g)
				.get(`/api/blocksByHour/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_CHART_HOUR }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockPerHour('mychannel')).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.BLOCK_CHART_HOUR);
			});
		});

		test('blockPerHour catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blocksByHour/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_CHART_HOUR }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockPerHour(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('blockPerMin', () => {
			nock(/\w*(\W)/g)
				.get(`/api/blocksByMinute/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_CHART_MIN }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockPerMin(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.BLOCK_CHART_MIN);
			});
		});

		test('blockPerMin catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blocksByMinute/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_CHART_MIN }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockPerMin(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('changeChannel', () => {
			nock(/\w*(\W)/g)
				.get(`/api/changeChannel/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHANGE_CHANNEL }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.changeChannel(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.CHANGE_CHANNEL);
			});
		});

		test('changeChannel catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/changeChannel/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHANGE_CHANNEL }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.changeChannel(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('channel', () => {
			nock(/\w*(\W)/g)
				.get('/api/curChannel')
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHANNEL }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channel()).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.CHANNEL);
			});
		});

		test('channel catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get('/api/curChannel')
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHANGE_CHANNEL }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channel()).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('channelList', () => {
			nock(/\w*(\W)/g)
				.get('/api/channels')
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.CHANNEL_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channelList()).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.CHANNEL_LIST);
			});
		});

		test('channelList catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get('/api/channels')
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.CHANNEL_LIST }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.channelList()).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('dashStats', () => {
			nock(/\w*(\W)/g)
				.get(`/api/status/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.DASHBOARD_STATS }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.dashStats(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.DASHBOARD_STATS);
			});
		});

		test('dashStats catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/status/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.DASHBOARD_STATS }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.dashStats(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('notification', () => {
			const expectedActions = [{ type: types.NOTIFICATION_LOAD }];
			const store = mockStore(initialState, expectedActions);

			store.dispatch(operations.notification('{"test": true}'));
			const actions = store.getActions();
			expect(actions[0].type).toBe(types.NOTIFICATION_LOAD);
		});

		test('transactionByOrg', () => {
			nock(/\w*(\W)/g)
				.get(`/api/txByOrg/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_CHART_ORG }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionByOrg(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.TRANSACTION_CHART_ORG);
			});
		});

		test('transactionByOrg catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txByOrg/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_CHART_ORG }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionByOrg(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('transactionPerHour', () => {
			nock(/\w*(\W)/g)
				.get(`/api/txByHour/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_CHART_HOUR }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionPerHour(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.TRANSACTION_CHART_HOUR);
			});
		});

		test('transactionPerHour catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txByHour/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_CHART_HOUR }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionPerHour(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('transactionPerMin', () => {
			nock(/\w*(\W)/g)
				.get(`/api/txByMinute/${channel}/1`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.TRANSACTION_CHART_MIN }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionPerMin(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.TRANSACTION_CHART_MIN);
			});
		});

		test('transactionPerMin catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/txByMinute/${channel}/1`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.TRANSACTION_CHART_MIN }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.transactionPerMin(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});

		test('blockActivity', () => {
			nock(/\w*(\W)/g)
				.get(`/api/blockActivity/${channel}`)
				.reply(200, {
					rows: [{ test: 'rows' }]
				});

			const expectedActions = [{ type: types.BLOCK_ACTIVITY }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockActivity(channel)).then(() => {
				const actions = store.getActions();
				expect(actions[0].type).toBe(types.BLOCK_ACTIVITY);
			});
		});

		test('blockActivity catch error', () => {
			jest.spyOn(console, 'error');
			nock(/\w*(\W)/g)
				.get(`/api/blockActivity/${channel}`)
				.replyWithError({ code: 'ECONNREFUSED' });

			const expectedActions = [{ type: types.BLOCK_ACTIVITY }];
			const store = mockStore(initialState, expectedActions);

			return store.dispatch(operations.blockActivity(channel)).then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([]);
			});
		});
	});

	describe('Reducers', () => {
		test('blockPerHourReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getBlockPerHour(payload);

			const newState = reducers(initialState, action);
			expect(newState.blockPerHour.rows).toBe('test');
		});

		test('blockPerMinReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getBlockPerMin(payload);

			const newState = reducers(initialState, action);
			expect(newState.blockPerMin.rows).toBe('test');
		});

		test('channelListReducer', () => {
			const payload = { channels: 'test' };
			const action = actions.getChannelList(payload);

			const newState = reducers(initialState, action);
			expect(newState.channelList.list).toBe('test');
		});

		describe('channelReducer', () => {
			test('getChannel action', () => {
				const payload = 'test';
				const action = actions.getChannel(payload);

				const newState = reducers(initialState, action);
				expect(newState.channel).toBe('test');
			});

			test('updateChannel action', () => {
				const payload = 'test';
				const action = actions.updateChannel(payload);

				const newState = reducers(initialState, action);
				expect(newState.channel).toBe('test');
			});
		});

		test('dashStatsReducer', () => {
			const payload = 'test';
			const action = actions.getDashStats(payload);

			const newState = reducers(initialState, action);
			expect(newState.dashStats).toBe('test');
		});

		test('notificationReducer', () => {
			const payload = 'test';
			const action = actions.getNotification(payload);

			const newState = reducers(initialState, action);
			expect(newState.notification).toBe('test');
		});


		test('transactionByOrgReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getTransactionByOrg(payload);

			const newState = reducers(initialState, action);
			expect(newState.transactionByOrg.rows).toBe('test');
		});

		test('transactionPerHourReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getTransactionPerHour(payload);

			const newState = reducers(initialState, action);
			expect(newState.transactionPerHour.rows).toBe('test');
		});

		test('transactionPerMinReducer', () => {
			const payload = { rows: 'test' };
			const action = actions.getTransactionPerMin(payload);

			const newState = reducers(initialState, action);
			expect(newState.transactionPerMin.rows).toBe('test');
		});

		test('errorMessageReducer', () => {
			const payload = 'error';
			const action = actions.getErroMessage(payload);

			const newState = reducers(initialState, action);
			expect(newState.errorMessage.error).toBe('error');
		});

		test('blockActivityReducer', () => {
			const payload = { row: 'testing' };
			const action = actions.getBlockActivity(payload);

			const newState = reducers(initialState, action);
			expect(newState.blockActivity.rows).toBe('testing');
		});
	});

	describe('selector', () => {
		test('blockPerHourSelector', () => {
			const state = { charts: { blockPerHour: { rows: 'test' } } };
			const blockPerHour = selectors.blockPerHourSelector(state);
			expect(blockPerHour).toBe('test');
		});

		test('blockPerMinSelector', () => {
			const state = { charts: { blockPerMin: { rows: 'test' } } };
			const blockPerMin = selectors.blockPerMinSelector(state);
			expect(blockPerMin).toBe('test');
		});

		test('channelListSelector', () => {
			const state = { charts: { channelList: { list: 'test' } } };
			const channelList = selectors.channelListSelector(state);
			expect(channelList).toBe('test');
		});

		test('currentChannelSelector', () => {
			const state = { charts: { channel: { currentChannel: 'test' } } };
			const currentChannel = selectors.currentChannelSelector(state);
			expect(currentChannel).toBe('test');
		});
	});

	test('dashStatsSelector', () => {
		const state = { charts: { dashStats: 'test' } };
		const dashStats = selectors.dashStatsSelector(state);
		expect(dashStats).toBe('test');
	});

	test('notificationSelector', () => {
		const state = { charts: { notification: 'test' } };
		const notification = selectors.notificationSelector(state);
		expect(notification).toBe('test');
	});


	test('transactionByOrgSelector', () => {
		const state = { charts: { transactionByOrg: { rows: 'test' } } };
		const transactionByOrg = selectors.transactionByOrgSelector(state);
		expect(transactionByOrg).toBe('test');
	});

	test('transactionPerHourSelector', () => {
		const state = { charts: { transactionPerHour: { rows: 'test' } } };
		const transactionPerHour = selectors.transactionPerHourSelector(state);
		expect(transactionPerHour).toBe('test');
	});

	test('transactionPerMinSelector', () => {
		const state = { charts: { transactionPerMin: { rows: 'test' } } };
		const transactionPerMin = selectors.transactionPerMinSelector(state);
		expect(transactionPerMin).toBe('test');
	});

	test('errorMessageSelector', () => {
		const state = { charts: { errorMessage: { error: 'test' } } };
		const errorMessage = selectors.errorMessageSelector(state);
		expect(errorMessage).toBe('test');
	});

	test('blockActivitySelector', () => {
		const state = { charts: { blockActivity: { rows: 'test' } } };
		const blockActivity = selectors.blockActivitySelector(state);
		expect(blockActivity).toBe('test');
	});
});
