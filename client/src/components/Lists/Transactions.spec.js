/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import ReactTable from '../Styled/Table';
import { Transactions } from './Transactions';
import TransactionView from '../View/TransactionView';
import moment from 'moment';

jest.useFakeTimers();

const setup = prop => {
	const propsbase = {
		classes: {
			hash: 'hash',
			partialHash: 'partialHash',
			fullHash: 'fullHash',
			lastFullHash: 'lastFullHash'
		},
		countHeader: {
			chaincodeCount: '1',
			latestBlock: 20,
			peerCount: '4',
			txCount: '36'
		},
		currentChannel: 'mychannel',
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
		transaction: {
			id: 39,
			channelname: 'mychannel',
			blockid: 19,
			txhash: '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
			createdt: '2018-04-26T20:32:12.000Z',
			chaincodename: 'mycc',
			status: 200,
			creator_msp_id: 'Org1MSP',
			endorser_msp_id: "{'Org1MSP'}",
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
		orgs: ['org1', 'org2'],
		transactionList: [
			{
				blockid: 20,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 41,
				read_set: [],
				status: 200,
				txhash: '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			},
			{
				blockid: 20,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 40,
				read_set: [],
				status: 200,
				txhash: '9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			},
			{
				blockid: 19,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 39,
				read_set: [],
				status: 200,
				txhash: '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			}
		],
		transactionListSearch: [
			{
				blockid: 20,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 41,
				read_set: [],
				status: 200,
				txhash: '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			},
			{
				blockid: 20,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 40,
				read_set: [],
				status: 200,
				txhash: '9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			},
			{
				blockid: 19,
				chaincode_id: '',
				chaincodename: 'mycc',
				channelname: 'mychannel',
				createdt: '4-26-2018 4:32 PM EDT',
				creator_msp_id: 'Org1MSP',
				endorser_msp_id: "{'Org1MSP'}",
				id: 39,
				read_set: [],
				status: 200,
				txhash: '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
				type: 'ENDORSER_TRANSACTION',
				write_set: []
			}
		],
		getTransactionList: jest.fn(),
		getTransactionListSearch: jest.fn(),
		getTransaction: jest.fn(),
		getTransactionInfo: jest.fn(),
		handleDialogClose: jest.fn(),
		removeTransactionInfo: jest.fn(),
		getOrgs: jest.fn().mockImplementationOnce(() => Promise.resolve())
	};

	const props = { ...propsbase, ...prop };
	const wrapper = mount(<Transactions {...props} />);

	return {
		props,
		wrapper
	};
};

describe('Transactions', () => {
	test('Transactions and ReactTable components should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
		expect(wrapper.find(ReactTable).exists()).toBe(true);
	});

	test('Table displays transaction data', () => {
		const { wrapper } = setup();
		// Creator
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('Org1MSP'))
				.exists()
		).toBe(true);
		// Tx Id
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('308a24'))
				.exists()
		).toBe(true);
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('9abc8c'))
				.exists()
		).toBe(true);
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('912cd6'))
				.exists()
		).toBe(true);
		// Type
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('ENDORSER_TRANSACTION'))
				.exists()
		).toBe(true);
		// Chaincode
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('mycc'))
				.exists()
		).toBe(true);
		// Number of Transactions
		expect(
			wrapper
				.find('TdComponent')
				.findWhere(n => n.contains('4-26-2018 4:32 PM EDT'))
				.exists()
		).toBe(true);
	});

	test('Modal for transaction View should not exist', () => {
		const { wrapper } = setup();
		expect(wrapper.find(TransactionView).exists()).toBe(false);
	});

	test('Modal for transaction View should exist', () => {
		const { wrapper } = setup();
		wrapper.setState({ dialogOpen: true });
		wrapper.update();
		expect(wrapper.find(TransactionView).exists()).toBe(true);
	});

	test('handleDialogOpen should set dialogOpen to true', async () => {
		const { wrapper } = setup();
		await wrapper
			.instance()
			.handleDialogOpen(
				'912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6'
			);
		expect(wrapper.state('dialogOpen')).toBe(true);
		wrapper.update();
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

	test(' Creator filterMethod should have no results when given a value of 2', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '0-creator_msp_id')
			.find('input')
			.simulate('change', { target: { value: '2' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(0);
	});

	test('Simulate Tx Id filterMethod should have one result when given a transaction hash', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '2-txhash')
			.find('input')
			.simulate('change', {
				target: {
					value: '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80'
				}
			});
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
	});

	test('Simulate Type filterMethod should have three result when given a value of end', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '3-type')
			.find('input')
			.simulate('change', { target: { value: 'end' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(3);
	});

	test('Simulate Chaincode filterMethod should have no results when given a value of newcc', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '4-chaincodename')
			.find('input')
			.simulate('change', { target: { value: 'newcc' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(0);
	});

	test('Simulate Timestamp filterMethod should have three results when given a value of 4-26', () => {
		const { wrapper } = setup();
		wrapper
			.find('ThComponent')
			.findWhere(n => n.key() === '5-createdt')
			.find('input')
			.simulate('change', { target: { value: '4-26' } });
		expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(3);
	});

	/* We are no more using the functionality to show/hide the element.
  test('click on eye', () => {
    const { wrapper } = setup()
    wrapper.find('.eyeBtn').at(0).simulate('click')
    expect(Object.values(wrapper.state('selection'))).toContain(true)
  })
*/
	test('click on partialHash', async () => {
		const { wrapper } = setup();
		await wrapper
			.find('a[data-command="transaction-partial-hash"]')
			.at(0)
			.simulate('click');
		expect(wrapper.state('dialogOpen')).toBe(true);
	});

	test('pagination when transactionList is greater than 4', () => {
		const { wrapper, props } = setup();
		const { transactionList } = props;
		const transactions = transactionList;
		const transaction = transactionList[0];
		Array.prototype.push.apply(transactions, [
			transaction,
			transaction,
			transaction
		]);
		expect(wrapper.find('.pagination-bottom').exists()).toBe(false);
		wrapper.setProps({ transactionList: transactions });
		expect(wrapper.find('.pagination-bottom').exists()).toBe(true);
	});

	test('calls componentDidMount', () => {
		jest.spyOn(Transactions.prototype, 'componentDidMount');
		expect(Transactions.prototype.componentDidMount.mock.calls.length).toBe(0);
	});

	test('calls componentWillReceiveProps', () => {
		jest.spyOn(Transactions.prototype, 'componentWillReceiveProps');
		expect(
			Transactions.prototype.componentWillReceiveProps.mock.calls.length
		).toBe(0);
	});

	test('searchTransactionList gets called in componentWillReceiveProps when a new prop is set', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchTransactionList');
		const currentChannel = [
			{
				currentChannel: 'MyChannel'
			}
		];
		wrapper.setProps({ currentChannel });
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('clearInterval gets called in componentWillReceiveProps when inteval has already been set', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchTransactionList');

		const currentChannel = [
			{
				currentChannel: 'MyChannel'
			}
		];

		wrapper.setProps({ currentChannel });

		expect(clearInterval).toHaveBeenCalled();
		expect(spy).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(70000);

		expect(spy).toHaveBeenCalledTimes(2);
	});

	test('calls componentWillUnmount', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'componentWillUnmount');

		wrapper.unmount();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(clearInterval).toHaveBeenCalled();
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

	test('search transaction of specified orgs', () => {
		const { props, wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ orgs: ['org_a', 'org_b'] });
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchTransactionList');

		const currentChannel = [
			{
				currentChannel: 'MyChannel'
			}
		];
		wrapper.setProps({ currentChannel });
		expect(spy).toHaveBeenCalledTimes(1);
		expect(props.getTransactionListSearch).toHaveBeenCalled();
		expect(props.getTransactionListSearch.mock.calls[0][1]).toContain(
			'&&orgs=org_a&&orgs=org_b'
		);
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

	test('Simulate onClick when a search button is clicked', async () => {
		const { wrapper } = setup();
		wrapper.setState({ search: false });
		const instance = wrapper.instance();
		instance.searchTransactionList = jest.fn();

		await wrapper.find('.btn-success').simulate('click');
		wrapper.update();

		expect(setInterval).toHaveBeenCalled();
		expect(instance.searchTransactionList).toHaveBeenCalled();
		expect(wrapper.state('search')).toBe(true);
	});

	test('searchBlockList gets scheduled when a search button is clicked first time', async () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		instance.interval = 1;
		const spy = jest.spyOn(instance, 'searchTransactionList');

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
		wrapper.setState({ search: true });

		await wrapper.find('.btn-primary').simulate('click');
		wrapper.update();

		expect(wrapper.state('search')).toBe(false);
		expect(wrapper.state('orgs').length).toBe(0);
	});

	test('rendered table when txhash in a transaction is empty', () => {
		const incomplete_transaction = {
			transactionList: [
				{
					blockid: 20,
					chaincode_id: '',
					chaincodename: 'mycc',
					channelname: 'mychannel',
					createdt: '4-26-2018 4:32 PM EDT',
					creator_msp_id: 'Org1MSP',
					endorser_msp_id: "{'Org1MSP'}",
					id: 41,
					read_set: [],
					status: 200,
					txhash: '',
					type: 'ENDORSER_TRANSACTION',
					write_set: []
				}
			]
		};
		const { props, wrapper } = setup(incomplete_transaction);

		const txhash = wrapper.find('[data-command="transaction-partial-hash"]');
		expect(txhash.exists()).toBe(true);
		expect(
			txhash
				.at(0)
				.text()
				.trim()
		).toBe(''); // Tx Id
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

	test('filtered state gets cleared when click clear button', () => {
		const { props, wrapper } = setup();
		wrapper.setState({ filtered: ['a', 'b', 'c'], sorted: ['d', 'e'] });
		wrapper.find('.btn-secondary').simulate('click');
		wrapper.update();
		expect(wrapper.state('filtered').length).toBe(0);
		expect(wrapper.state('sorted').length).toBe(0);
	});
});
