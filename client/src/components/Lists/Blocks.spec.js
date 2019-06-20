/**
 *   SPDX-License-Identifier: CC-BY-4.0
 */

import ReactTable from '../Styled/Table';
import { Blocks } from './Blocks';
import TransactionView from '../View/TransactionView';

jest.useFakeTimers();

const setup = () => {
	const props = {
		classes: {
			hash: 'hash',
			partialHash: 'partialHash',
			fullHash: 'fullHash',
			lastFullHash: 'lastFullHash'
		},
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
		getBlockList: jest.fn(),
		removeTransactionInfo: jest.fn(),
		getTransactionInfo: jest.fn(),
		getTransaction: jest.fn().mockImplementationOnce(() => Promise.resolve()),
		getBlockListSearch: jest.fn(),
		getOrgs: jest.fn().mockImplementationOnce(() => Promise.resolve())
	};

	const wrapper = mount(<Blocks {...props} />);

	return {
		props,
		wrapper
	};
};

describe('Blocks', () => {
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
		await wrapper
			.find('TdComponent')
			.find('a')
			.at(1)
			.simulate('click');
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
			.at(0)
			.simulate('click');
		expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
		expect(wrapper.state('blockHash')).toMatchObject({
			blockhash: '6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f'
		});
	});

	/* We are no more using this functionality to show/hide the hash
  test('click on eye', () => {
    const { wrapper } = setup()
    wrapper.find('.eyeBtn').at(0).simulate('click')
    expect(Object.values(wrapper.state('selection'))).toContain(true)
  })
  */

	test('pagination when blockList is greater than 4', () => {
		const { wrapper, props } = setup();
		const { blockList } = props;
		const blocks = blockList;
		const block = blockList[0];
		Array.prototype.push.apply(blocks, [block, block, block]);
		expect(wrapper.find('.pagination-bottom').exists()).toBe(false);
		wrapper.setProps({ blockList: blocks });
		expect(wrapper.find('.pagination-bottom').exists()).toBe(true);
	});

	test('calls componentDidMount', () => {
		jest.spyOn(Blocks.prototype, 'componentDidMount');
		expect(Blocks.prototype.componentDidMount.mock.calls.length).toBe(0);
	});

	test('calls componentWillReceiveProps', () => {
		jest.spyOn(Blocks.prototype, 'componentWillReceiveProps');
		expect(Blocks.prototype.componentWillReceiveProps.mock.calls.length).toBe(0);
	});

	test('searchBlockList gets called in componentWillReceiveProps when a new prop is set', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		wrapper.setState({ search: true });
		const spy = jest.spyOn(instance, 'searchBlockList');
		const currentChannel = [
			{
				currentChannel: 'MyChannel'
			}
		];
		wrapper.setProps({ currentChannel });
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('handleSearch should work properly', async () => {
		const { wrapper } = setup();
		await wrapper.instance().searchBlockList();
		wrapper.update();
		expect(setInterval).toHaveBeenCalled();
		jest.runOnlyPendingTimers();
		expect(wrapper.state('search')).toBe(false);
	});
});
