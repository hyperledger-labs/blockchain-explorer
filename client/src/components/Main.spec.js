/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { Main } from './Main';

const setup = () => {
  const props = {
    classes: { main: 'main' },
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
        prehash:
          '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
        prev_blockhash: null,
        txcount: 2,
        txhash: [
          '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
          '9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1',
        ],
      },
    ],
    chaincodeList: [
      {
        chaincodename: 'mycc',
        channelName: 'mychannel',
        path: 'github.com/chaincode/chaincode_example02/go/',
        source: 'Location not found',
        txCount: 32,
        version: '1.0',
      },
    ],
    channels: [
      {
        blocks: 5,
        channel_hash:
          '0bc9fb4bca66ff0583e39e888eebdf9e01f976d292af3e9deff7d3199ecf3977',
        channelname: 'mychannel',
        createdat: '2018-05-30T20:56:47.795Z',
        id: 3,
        transactions: 5,
      },
    ],
    currentChannel: 'mychannel',
    dashStats: {
      chaincodeCount: '3',
      latestBlock: '12',
      peerCount: '4',
      txCount: '33',
    },
    getTransaction: jest.fn(),
    peerList: [
      {
        channel_genesis_hash:
          'f3ed9c95452b184a4d5d66e25ba47f866ad6907a31f28f8067ca5596f64d8e0f',
        name: 'mychannel',
        requests: 'grpcs://127.0.0.1:7051',
        server_hostname: 'peer0.org1.example.com',
      },
      {
        requests: 'grpcs://127.0.0.1:8051',
        server_hostname: 'peer1.org1.example.com',
      },
      {
        requests: 'grpcs://127.0.0.1:9051',
        server_hostname: 'peer0.org2.example.com',
      },
      {
        requests: 'grpcs://127.0.0.1:10051',
        server_hostname: 'peer1.org2.example.com',
      },
    ],
    peerStatus: [
      {
        server_hostname: 'peer0.org1.example.com',
        status: 'RUNNING',
      },
    ],
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
    transactionByOrg: [
      {
        count: '3',
        creator_msp_id: 'OrdererMSP',
      },
    ],
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
    ],
  };
  const wrapper = shallow(<Main {...props} />);

  return {
    wrapper,
  };
};

describe('Main', () => {
  test('Main component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
