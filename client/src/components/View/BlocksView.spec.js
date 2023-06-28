/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { BlocksView } from './BlocksView';
const blocks=[
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
]
const setup = () => {
  const props = {
    blockList: blocks,
		blockRangeSearch: blocks,
    countHeader: {
      chaincodeCount: '1',
      latestBlock: 20,
      peerCount: '4',
      txCount: '36',
    },
    currentChannel: 'mychannel',
    transaction: {
      id: 39,
      channelname: 'mychannel',
      blockid: 19,
      txhash:
        '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
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
                tx_num: '0',
              },
            },
          ],
        },
        {
          chaincode: 'mycc',
          set: [
            {
              key: 'a',
              version: {
                block_num: '18',
                tx_num: '0',
              },
            },
            {
              key: 'b',
              version: {
                block_num: '18',
                tx_num: '0',
              },
            },
          ],
        },
      ],
      write_set: [
        {
          chaincode: 'lscc',
          set: [],
        },
        {
          chaincode: 'lscc',
          set: [
            {
              is_delete: false,
              key: 'a',
              value: '-60',
            },
            {
              is_delete: false,
              key: 'b',
              value: '360',
            },
          ],
        },
      ],
    },
    getBlockList: jest.fn(),
    getTransactionInfo: jest.fn(),
    getCountHeader: jest.fn(),
    getLatestBlock: jest.fn(),
    getTransaction: jest.fn(),
  };

  const wrapper = shallow(<BlocksView {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('BlocksView', () => {
  test('BlocksView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  /* test('componentWillReceiveProps calls syncData()', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance()
    const spy = jest.spyOn(instance, 'syncData');
    const channel = { currentChannel: 'newChannel' }
    wrapper.setProps({ channel });
    expect(spy).toHaveBeenCalled();
  })

  test('componentWillReceiveProps does not call syncData()', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance()
    const spy = jest.spyOn(instance, 'syncData');
    const channel = { currentChannel: 'mychannel' }
    wrapper.setProps({ channel });
    expect(spy).not.toHaveBeenCalled();
  }) */

  /* test('syncData calls the selectors', () => {
    const { wrapper, props } = setup();
    wrapper.instance().syncData('newData')
    expect(props.getCountHeader).toHaveBeenCalled();
    expect(props.getLatestBlock).toHaveBeenCalled();
    expect(props.getBlockList).toHaveBeenCalled();
  }) */
});
