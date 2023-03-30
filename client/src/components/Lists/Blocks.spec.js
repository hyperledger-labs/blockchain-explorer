/**
 *   SPDX-License-Identifier: Apache-2.0
 */

import ReactTable from '../Styled/Table';
import { Blocks } from './Blocks';
import TransactionView from '../View/TransactionView';
import moment from 'moment';
import { TablePagination } from '@mui/material';
import { E001, E002, E003, E004 } from './constants';

const setup = prop => {
	const propsbase = {
		classes: {
			hash: 'hash',
			partialHash: 'partialHash',
			fullHash: 'fullHash',
			lastFullHash: 'lastFullHash'
		},
		channelhash: 'xyz',
		blockList: [
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'7880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 19,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:11.000Z',
				datahash:
					'1adc2b51cb7d7df44f114fc42df1f6fdca64a5da3f9a07edbd3b0d8060bb2edf',
				id: 20,
				prehash: '68f4481e0caec16a5aceebabd01cb31635d9f0a8cf9f378f86e06b76c21c633d',
				prev_blockhash: null,
				txcount: 3,
				txhash: [
					'912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
					'a9cc2d309967fbba0d9575319ea0c7eb75e7c003142e6c43060015e59909d91d',
					'85770c2057e4b63504de6fa8b0c711f33ec897d9e8fc10659d7712e51d57c513'
				]
			}
		],
		blockListSearch: [
			{
				blockhash:
					'1234fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539ffff',
				blocknum: 21,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:15.000Z',
				datahash:
					'987352e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9199c',
				id: 21,
				prehash: '6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'333324cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74d9187',
					'89218cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bd1a33'
				]
			},
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'7880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 19,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:11.000Z',
				datahash:
					'1adc2b51cb7d7df44f114fc42df1f6fdca64a5da3f9a07edbd3b0d8060bb2edf',
				id: 20,
				prehash: '68f4481e0caec16a5aceebabd01cb31635d9f0a8cf9f378f86e06b76c21c633d',
				prev_blockhash: null,
				txcount: 3,
				txhash: [
					'912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
					'a9cc2d309967fbba0d9575319ea0c7eb75e7c003142e6c43060015e59909d91d',
					'85770c2057e4b63504de6fa8b0c711f33ec897d9e8fc10659d7712e51d57c513'
				]
			}
		],
		countHeader: {
			chaincodeCount: '1',
			latestBlock: 20,
			peerCount: '4',
			txCount: '36'
		},
		currentChannel: 'mychannel',
		transaction: {
			id: 39,
			channelname: 'mychannel',
			blockid: 19,
			txhash: '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
			createdt: '2018-04-26T20:32:12.000Z',
			chaincodename: 'mycc',
			status: 200,
			creator_msp_id: 'Org1MSP',
			endorser_msp_id: '{"Org1MSP"}',
			chaincode_id: '',
			type: 'ENDORSER_TRANSACTION',
			read_set: [
				{
					chaincode: 'lscc',
					set: [
						{
							key: 'mycc',
							version: {
								blocknum: '3',
								tx_num: '0'
							}
						}
					]
				},
				{
					chaincode: 'mycc',
					set: [
						{
							key: 'a',
							version: {
								block_num: '18',
								tx_num: '0'
							}
						},
						{
							key: 'b',
							version: {
								block_num: '18',
								tx_num: '0'
							}
						}
					]
				}
			],
			write_set: [
				{
					chaincode: 'lscc',
					set: []
				},
				{
					chaincode: 'lscc',
					set: [
						{
							is_delete: false,
							key: 'a',
							value: '-60'
						},
						{
							is_delete: false,
							key: 'b',
							value: '360'
						}
					]
				}
			]
		},
		transactionByOrg: [
			{
				count: '3',
				creator_msp_id: 'OrdererMSP'
			},
			{
				count: '1',
				creator_msp_id: 'Org2MSP'
			},
			{
				count: '100',
				creator_msp_id: 'Org1MSP'
			}
		],
		getblockListSearch: jest.fn(),
		removeTransactionInfo: jest.fn(),
		getTransactionInfo: jest.fn(),
		getTransaction: jest.fn().mockImplementationOnce(() => Promise.resolve()),
		getblockListSearch: jest.fn(),
		getOrgs: jest.fn().mockImplementationOnce(() => Promise.resolve())
	};
	const props = { ...propsbase, ...prop };
	const wrapper = mount(<Blocks {...props} />);

	return {
		props,
		wrapper
	};
};

describe('Blocks', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	test('Blocks and ReactTable components should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
		expect(wrapper.find(ReactTable).exists()).toBe(true);
	});

	test('Table displays block data', () => {
		const { wrapper } = setup();
		// Block Number
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains(20))
				.exists()
		).toBe(true);
		// Number of Tx
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains(2))
				.exists()
		).toBe(true);
		// Data Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n =>
					n.contains(
						'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e'
					)
				)
				.exists()
		).toBe(true);
		// Block Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('6880fc'))
				.exists()
		).toBe(true);
		// Previous Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n =>
					n.contains(
						'5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f'
					)
				)
				.exists()
		).toBe(true);
		// Number of Transactions
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(
					n =>
						n.type() === 'div' &&
						n.contains(
							'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80'
						)
				)
				.children()
				.children().length
		).toBe(2);

		// Block Number
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains(19))
				.exists()
		).toBe(true);
		// Number of Tx
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains(3))
				.exists()
		).toBe(true);
		// Data Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n =>
					n.contains(
						'1adc2b51cb7d7df44f114fc42df1f6fdca64a5da3f9a07edbd3b0d8060bb2edf'
					)
				)
				.exists()
		).toBe(true);
		// Block Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('7880fc'))
				.exists()
		).toBe(true);
		// Previous Hash
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n =>
					n.contains(
						'68f4481e0caec16a5aceebabd01cb31635d9f0a8cf9f378f86e06b76c21c633d'
					)
				)
				.exists()
		).toBe(true);
		// Number of Transactions
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(
					n =>
						n.type() === 'div' &&
						n.contains(
							'912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6'
						)
				)
				.children()
				.children().length
		).toBe(3);
	});

	test('Modal for transaction View should not exist', () => {
		const { wrapper } = setup();
		expect(wrapper.find(TransactionView).exists()).toBe(false);
	});

	test('handleDialogOpen should set dialogOpen to true', async () => {
		const { wrapper } = setup();
		await wrapper
			.instance()
			.handleDialogOpen(
				'912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6'
			);
		wrapper.update();
		expect(wrapper.state('dialogOpen')).toBe(true);
		expect(wrapper.find(TransactionView).exists()).toBe(true);
	});

	test('handleDialogClose should set dialogOpen to false', () => {
		const { wrapper } = setup();
		wrapper.setState({ dialogOpen: true });
		wrapper.update();
		wrapper.instance().handleDialogClose();
		wrapper.update();
		expect(wrapper.state('dialogOpen')).toBe(false);
	});

	test('Simulate Block Number filterMethod should have one result when given a value of 20', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '0-blocknum')
			.find('input')
			.simulate('change', { target: { value: '20' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simulate Number of Tx filterMethod should have one result when given a value of 3', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '2-txcount')
			.find('input')
			.simulate('change', { target: { value: '3' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simluate Data filterMethod should have one result when given a datahash', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '3-datahash')
			.find('input')
			.simulate('change', {
				target: {
					value: '2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e'
				}
			});
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});
	test('Simulate Block Hash filterMethod should have one result when given a block hash', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '4-blockhash')
			.find('input')
			.simulate('change', {
				target: {
					value: '6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f'
				}
			});
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simulate Previous Hash filterMethod should have one result when given a previous hash', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '5-prehash')
			.find('input')
			.simulate('change', {
				target: {
					value: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f'
				}
			});
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simulate Transaction filterMethod should have one result when given a transaction hash', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '6-txhash')
			.find('input')
			.simulate('change', {
				target: {
					value: '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80'
				}
			});
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simulate onClick when a tansaction is clicked the TransactionView modal should exist', async () => {
		const { wrapper } = setup();
		expect(wrapper.find(TransactionView).exists()).toBe(false);
		wrapper
			.find('TdComponent')
			.find('a')
			.at(1)
			.simulate('click');
		await Promise.resolve();
		wrapper.update();
		expect(wrapper.find(TransactionView).exists()).toBe(true);
	});

	test('handleEye toggles the state correctly', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const row = { index: 19 };
		const val = false;
		expect(wrapper.state('selection')[19]).toBe(false);
		instance.handleEye(row, val);
		expect(wrapper.state('selection')[19]).toBe(true);
	});

	test('handleDialogOpenBlockHash sets the correct state', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const blockHash =
			'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f';
		expect(wrapper.state('dialogOpenBlockHash')).toBe(false);
		expect(wrapper.state('blockHash')).not.toMatchObject({
			blockhash: blockHash
		});
		instance.handleDialogOpenBlockHash(blockHash);
		expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
		expect(wrapper.state('blockHash')).toMatchObject({ blockhash: blockHash });
	});

	test('handleDialogOpenBlockHash sets the correct state when search is true', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ search: true });
		const blockHash =
			'1234fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539ffff';
		expect(wrapper.state('dialogOpenBlockHash')).toBe(false);
		expect(wrapper.state('blockHash')).not.toMatchObject({
			blockhash: blockHash
		});
		instance.handleDialogOpenBlockHash(blockHash);
		expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
		expect(wrapper.state('blockHash')).toMatchObject({ blockhash: blockHash });
	});

	test('handleDialogCloseBlockHash sets dialogOpenBlockHash to fasle', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ dialogOpenBlockHash: true });
		instance.handleDialogCloseBlockHash();
		expect(wrapper.state('dialogOpenBlockHash')).toBe(false);
	});

	test('click on block hash', () => {
		const { wrapper } = setup();
		wrapper
			.find('a[data-command="block-partial-hash"]')
			.at(1)
			.simulate('click');
		expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
		expect(wrapper.state('blockHash')).toMatchObject({
			blockhash: '1234fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539ffff'
		});
	});

	/* We are no more using this functionality to show/hide the hash
  test('click on eye', () => {
    const { wrapper } = setup()
    wrapper.find('.eyeBtn').at(0).simulate('click')
    expect(Object.values(wrapper.state('selection'))).toContain(true)
  })
  */

	test('pagination when blockListSearch is greater than 0', () => {
		const { wrapper, props } = setup();
		expect(wrapper.find(TablePagination).exists()).toBe(true);
		wrapper.setProps({ blockListSearch: [] });
		expect(wrapper.find(TablePagination).exists()).toBe(false);
	});

	test('searchblockList gets called in componentDidUpdate when a new prop is set', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchblockList');
		const currentChannel = {
			currentChannel: 'MyChannel'
		};
		wrapper.setProps(currentChannel);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('clearInterval gets called in componentDidUpdate when inteval has already been set', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchblockList');

		const currentChannel = {
			currentChannel: 'MyChannel'
		};

		wrapper.setProps(currentChannel);

		expect(clearInterval).toHaveBeenCalled();
		expect(spy).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(70000);

		expect(spy).toHaveBeenCalledTimes(2);
	});

	test('calls componentWillUnmount', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'componentWillUnmount');
		instance.interval = 1;

		wrapper.unmount();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(clearInterval).toHaveBeenCalled();
	});

	test('handleSearch should work properly', async () => {
		const { wrapper, props } = setup();
		await wrapper.instance().searchblockList();
		wrapper.update();
		expect(props.getblockListSearch).toHaveBeenCalled();
		// jest.runOnlyPendingTimers();
		// expect(wrapper.state('search')).toBe(false);
	});

	test('Simulate onClick when a search button is clicked', async () => {
		const { wrapper } = setup();
		wrapper.setState({ search: false });
		const instance = wrapper.instance();
		instance.searchblockList = jest.fn();

		await wrapper.find('.btn-success').simulate('click');
		wrapper.update();

		expect(setInterval).toHaveBeenCalled();
		expect(instance.searchblockList).toHaveBeenCalled();
		expect(wrapper.state('search')).toBe(true);
	});

	test('searchblockList gets scheduled when a search button is clicked first time', async () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		const spy = jest.spyOn(instance, 'searchblockList');

		await wrapper.find('.btn-success').simulate('click');
		wrapper.update();

		expect(clearInterval).toHaveBeenCalled();
		expect(setInterval).toHaveBeenCalled();
		expect(spy).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(70000);

		expect(spy).toHaveBeenCalledTimes(2);
	});

	test('Simulate onClick when a clear button is clicked', async () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.searchblockList = jest.fn();
		wrapper.setState({ search: true, orgs: ['org_a', 'org_b'] });
		instance.interval = undefined;

		clearInterval.mockClear();

		await wrapper.find('.btn-primary').simulate('click');
		wrapper.update();

		expect(clearInterval).not.toHaveBeenCalled();
		expect(wrapper.state('search')).toBe(true);
		expect(wrapper.state('orgs').length).toBe(0);
	});

	test('clearInterval gets called in handleClearSearch when inteval has already been set', async () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		wrapper.setState({ search: true });

		clearInterval.mockClear();

		await wrapper.find('.btn-primary').simulate('click');
		wrapper.update();

		expect(clearInterval).toHaveBeenCalled();
		expect(wrapper.state('search')).toBe(true);
		expect(wrapper.state('orgs').length).toBe(0);
	});

	test('rendered when some of list items are selected', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		const selected = { orgs: ['org_a'] };
		const options = { options: ['org_a', 'org_b', 'org_c'] };
		wrapper.setState(selected);
		wrapper.setState(options);

		const header = wrapper.find('.dropdown-heading-value');
		expect(header.text()).toContain(selected.orgs.join(','));
	});

	test('rendered when all of list items are selected', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		const selected = { orgs: ['org_a', 'org_b', 'org_c'] };
		const options = { options: ['org_a', 'org_b', 'org_c'] };
		wrapper.setState(selected);
		wrapper.setState(options);

		const header = wrapper.find('.dropdown-heading-value');
		expect(header.text()).toContain('All Orgs Selected');
	});

	test('search block of specified orgs', () => {
		const { props, wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ orgs: ['org_a', 'org_b'] });
		wrapper.setState({ search: true, queryFlag:true });
		const spy = jest.spyOn(instance, 'searchBlockList');

		const currentChannel = {
			currentChannel: 'MyChannel'
		};
		wrapper.setProps(currentChannel);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(props.getblockListSearch).toHaveBeenCalled();
		expect(props.getblockListSearch.mock.calls[1][1]).toContain(
			'orgs=org_a&orgs=org_b'
		);
	});

	test('Date(from) is set without any errors', () => {
		const { props, wrapper } = setup();
		const datepicker = wrapper.find('DatePicker');
		expect(datepicker.exists()).toBe(true);
		datepicker.at(1).prop('onChange')(moment().subtract(1, 'days'));
		expect(wrapper.state('err')).toBe(false);
	});

	test('error is detected when set newer date to `from` than date of `to`', () => {
		const { props, wrapper } = setup();
		const datepicker = wrapper.find('DatePicker');
		expect(datepicker.exists()).toBe(true);
		datepicker.at(1).prop('onChange')(moment().add(1, 'days'));
		expect(wrapper.state('err')).toBe(true);
	});

	test('Date(to) is set without any errors', () => {
		const { props, wrapper } = setup();
		const datepicker = wrapper.find('DatePicker');
		expect(datepicker.exists()).toBe(true);
		datepicker.at(3).prop('onChange')(moment().add(1, 'days'));
		expect(wrapper.state('err')).toBe(false);
	});

	test('error is detected when set older date to `to` than date of `from`', () => {
		const { props, wrapper } = setup();
		const datepicker = wrapper.find('DatePicker');
		expect(datepicker.exists()).toBe(true);
		datepicker.at(3).prop('onChange')(moment().subtract(2, 'days'));
		expect(wrapper.state('err')).toBe(true);
	});

	test('handleMultiSelect gets called when selected is changed', () => {
		const { props, wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'handleMultiSelect');

		const orgSelect = wrapper.find('MultiSelect');
		expect(orgSelect.exists()).toBe(true);
		orgSelect.first().prop('onSelectedChanged')(['org_a', 'org_b']);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(wrapper.state('orgs')).toStrictEqual(['org_a', 'org_b']);
	});

	test('rendered table when blockListSearch is empty', () => {
		const incomplete_blockListSearch = {
			blockListSearch: [
				{
					blockhash: '',
					blocknum: 20,
					channelname: 'mychannel',
					createdt: '2018-04-26T20:32:13.000Z',
					datahash: '',
					id: 21,
					prehash: '',
					prev_blockhash: null,
					txcount: 2,
					txhash: [
						'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
						''
					]
				}
			]
		};
		const { props, wrapper } = setup(incomplete_blockListSearch);
	});

	test('rendered table when txhash array in blockListSearch is empty', () => {//hlf
		const incomplete_blockListSearch = {
			blockListSearch: [
				{
					blockhash: '',
					blocknum: 20,
					channelname: 'mychannel',
					createdt: '2018-04-26T20:32:13.000Z',
					datahash: '',
					id: 21,
					prehash: '',
					prev_blockhash: null,
					txcount: 2,
					txhash: null
				}
			]
		};
		const { props, wrapper } = setup(incomplete_blockListSearch);
		const table = wrapper.find('ReactTable');
		expect(table.exists()).toBe(true);
		const hashFields = table.find('.partialHash');
		expect(hashFields.length).toBe(3);
		expect(
			hashFields
				.at(0)
				.text()
				.trim()
		).toBe(''); // Data Hash
		expect(
			hashFields
				.at(1)
				.text()
				.trim()
		).toBe(''); // Block Hash
		expect(
			hashFields
				.at(2)
				.text()
				.trim()
		).toBe(''); // Previous Hash

		const txhash = wrapper
			.find('TdComponent')
			.find('div')
			.find('.hash')
			.find('ul');
		expect(
			txhash
				.last()
				.text()
				.trim()
		).toBe('null'); // TX Hash
	});
	test('Test block range search from and to fields', () => {
		const { wrapper } = setup();
		const startBlock = wrapper.find('input#startBlock');
		const endBlock = wrapper.find('input#endBlock');
		const blockRangeSearh = wrapper.find('#blockRangeSearchIcon');
		expect(startBlock.exists()).toBe(true);
		expect(wrapper.state('rangeErr')).toBe("");
		//'To' field is empty
		startBlock.simulate('change',{target:{name:'startBlock',value:'21'}});
		blockRangeSearh.simulate('click');
		expect(wrapper.state('rangeErr')).toBe(E001);
		//'To' < 'From
		endBlock.simulate('change',{target:{name:'endBlock',value:'10'}});
		expect(wrapper.state('rangeErr')).toBe("");
		blockRangeSearh.simulate('click');
		expect(wrapper.state('rangeErr')).toBe(E002);
		//'From' - 'To' > rangeLimit
		endBlock.simulate('change',{target:{name:'endBlock', value:'40'}});
		expect(wrapper.state('rangeErr')).toBe("");
		blockRangeSearh.simulate('click');
		expect(wrapper.state('rangeErr')).toBe(E004(10));
		//change rangeLimit to 100 && 'From' - 'To' > rangeLimit
		wrapper.setState({rangeLimit:100});
		expect(wrapper.state('rangeLimit')).toBe(100);
		endBlock.simulate('change',{target:{name:'endBlock',value:'130'}});
		expect(wrapper.state('rangeErr')).toBe("");
		blockRangeSearh.simulate('click');
		expect(wrapper.state('rangeErr')).toBe(E003);
		//valid From and To, will make api call
		endBlock.simulate('change',{target:{name:'endBlock',value:'120'}});
		expect(wrapper.state('rangeErr')).toBe("");
		expect(wrapper.state('brs')).toBe(false);
		blockRangeSearh.simulate('click');
		expect(wrapper.state('rangeErr')).toBe("");
		expect(wrapper.state('brs')).toBe(true);
	});
});
