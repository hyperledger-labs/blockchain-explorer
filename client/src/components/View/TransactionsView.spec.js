/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { TransactionsView } from './TransactionsView';

const setup = () => {
  const props = {
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
        txhash:
          '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
        type: 'ENDORSER_TRANSACTION',
        write_set: [],
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
        txhash:
          '9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1',
        type: 'ENDORSER_TRANSACTION',
        write_set: [],
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
        txhash:
          '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
        type: 'ENDORSER_TRANSACTION',
        write_set: [],
      },
    ],
    getTransactionList: jest.fn(),
    getTransactionInfo: jest.fn(),
    getCountHeader: jest.fn(),
    getLatestBlock: jest.fn(),
    getTransaction: jest.fn(),
  };

  const wrapper = shallow(<TransactionsView {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('TransactionsView', () => {
  test('TransactionsView component should render', () => {
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
});
