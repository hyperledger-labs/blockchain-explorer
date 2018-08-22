/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { TransactionView } from './TransactionView';

const setup = () => {
  const props = {
    classes: {
      listIcon: 'listIcon'
    },
    currentChannel: 'mychannel',
    getTransaction: jest.fn(),
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
    }
  };

  const wrapper = mount(<TransactionView {...props} />);

  return {
    wrapper
  };
};

describe('TransactionView', () => {
  test('TransactionView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  // test('componentWillReceiveProps sets loading to false', () => {
  //   const { wrapper } = setup();
  //   wrapper.setState({ loading: true });
  //   wrapper.setProps({ new: 'prop' });
  //   expect(wrapper.state('loading')).toBe(false);
  // });

  test('undefined read_set', () => {
    const { wrapper } = setup();
    wrapper.setProps({ transaction: { read_set: undefined } });
    expect(wrapper.find('FontAwesome').exists()).toBe(true);
  });

  test('null read and write set', () => {
    const { wrapper } = setup();
    const newTransaction = {
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
        endorser_msp_id: '{"Org1MSP"}',
        chaincode_id: '',
        type: 'ENDORSER_TRANSACTION',
        read_set: null,
        write_set: null
      }
    };
    wrapper.setProps(newTransaction);
    expect(wrapper.find('li').exists()).toBe(false);
  });

  test('null read_set version', () => {
    const { wrapper } = setup();
    const newTransaction = {
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
        endorser_msp_id: '{"Org1MSP"}',
        chaincode_id: '',
        type: 'ENDORSER_TRANSACTION',
        read_set: [
          null,
          {
            chaincode: 'mycc',
            set: [
              {
                key: 'a',
                version: null
              },
              {
                key: 'b',
                version: null
              }
            ]
          }
        ],
        write_set: [
          null,
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
      }
    };
    wrapper.setProps(newTransaction);
    expect(wrapper.find('JSONTree').exists()).toBe(true);
  });
});
