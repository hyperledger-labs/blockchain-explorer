/**
 *    SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable react-in-jsx-scope */

import React from 'react';
import ReactTable from '../Styled/Table';
import { Chaincodes } from './Chaincodes';
import ChaincodeMetaDataView from '../View/ChaincodeMetaDataView';//s

jest.useFakeTimers();

const setup = () => {
  const props = {
    classes: {
      hash: 'hash',
    },
    chaincodeList: [
      {
        chaincodename: 'mycc',
        channelName: 'mychannel',
        path: '"github.com/chaincode/chaincode_example02/go/"',
        txCount: 33,
        version: '1.0',
      },
    ],
    channel: {
      currentChannel: 'mychannel',
    },
    countHeader: {
      chaincodeCount: '1',
      latestBlock: 20,
      peerCount: '4',
      txCount: '36',
    },
    getChaincodes: jest.fn(),
    getChaincodeMetaData: jest.fn()
  };

  const chaincode = {
    chaincodename: 'mycc',
    channelName: 'mychannel',
    path: 'github.com/chaincode/chaincode_example02/go/',
    source: 'Location not found',
    txCount: 32,
    version: '1.0',
  };

  const wrapper = mount(<Chaincodes {...props} />);

  return {
    chaincode,
    props,
    wrapper,
  };
};

describe('Chaincodes', () => {
  test('Chaincodes and ReactTable components should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(ReactTable).exists()).toBe(true);
  });

  test('Table displays chaincode data', () => {
    const { wrapper } = setup();
    // Chaincode Name
    expect(
      wrapper
        .find('TdComponent')
        .findWhere(n => n.contains('mycc'))
        .exists(),
    ).toBe(true);
    // Channel Name
    expect(
      wrapper
        .find('TdComponent')
        .findWhere(n => n.contains('mychannel'))
        .exists(),
    ).toBe(true);
    // Path
    expect(
      wrapper
        .find('TdComponent')
        .findWhere(n => n.contains('"github.com/chaincode/chaincode_example02/go/"'))
        .exists(),
    ).toBe(true);
    // Transition Count
    expect(
      wrapper
        .find('TdComponent')
        .findWhere(n => n.contains(33))
        .exists(),
    ).toBe(true);
    // Version
    expect(
      wrapper
        .find('TdComponent')
        .findWhere(n => n.contains('1.0'))
        .exists(),
    ).toBe(true);
  });

  test('Simulate Chaincode Name filterMethod should have one result when given a value of mycc', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '0-chaincodename')
      .find('input')
      .simulate('change', { target: { value: 'mycc' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Channel Name filterMethod should have one result when given a value of mychannel', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '1-channelName')
      .find('input')
      .simulate('change', { target: { value: 'mychannel' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Path filterMethod should have one result when given a value of github', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '2-path')
      .find('input')
      .simulate('change', { target: { value: 'github' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Transaction Count filterMethod should have one result when given a value of 33', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '3-txCount')
      .find('input')
      .simulate('change', { target: { value: '33' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Version filterMethod should have one result when given a value of 1', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '4-version')
      .find('input')
      .simulate('change', { target: { value: '1' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Modal for ChaincodeMetaDataView View should not exist', () => {
		const { wrapper } = setup();
		expect(wrapper.find(ChaincodeMetaDataView).exists()).toBe(false);
	});

	test('Modal for ChaincodeMetaDataView View should exist', () => {
		const { wrapper } = setup();
		wrapper.setState({ dialogOpen: true });
		wrapper.update();
		expect(wrapper.find(ChaincodeMetaDataView).exists()).toBe(true);
	});

	test('handleDialogOpen should set dialogOpen to true', async () => {
		const { wrapper } = setup();
		await wrapper
			.instance()
			.handleDialogOpen(
				'basic'
			);
		expect(wrapper.state('dialogOpen')).toBe(true);
		wrapper.update();
		expect(wrapper.find(ChaincodeMetaDataView).exists()).toBe(true);
	});

	test('handleDialogClose should set dialogOpen to false', () => {
		const { wrapper } = setup();
		wrapper.setState({ dialogOpen: true });
		wrapper.update();
		wrapper.instance().handleDialogClose();
		wrapper.update();
		expect(wrapper.state('dialogOpen')).toBe(false);
	});

  test('sourceDialogOpen', () => {
    const { wrapper, chaincode } = setup();
    wrapper.instance().sourceDialogOpen(chaincode);
    expect(wrapper.state('sourceDialog')).toBe(true);
    expect(wrapper.state('chaincode')).toBe(chaincode);
  });

  test('sourceDialogClose sets state to false', () => {
    const { wrapper, chaincode } = setup();
    wrapper.instance().sourceDialogOpen(chaincode);
    wrapper.instance().sourceDialogClose();
    expect(wrapper.state('sourceDialog')).toBe(false);
  });

  test('pagination when chaincodes is greater than 4', () => {
    const { wrapper, chaincode } = setup();
    const chaincodes = [
      chaincode,
      chaincode,
      chaincode,
      chaincode,
      chaincode,
      chaincode,
    ];
    expect(wrapper.find('.pagination-bottom').exists()).toBe(false);
    wrapper.setProps({ chaincodeList: chaincodes });
    expect(wrapper.find('.pagination-bottom').exists()).toBe(true);
  });

  /*   test('button onClick', () => {
    const { wrapper } = setup();
    wrapper.find('Button').simulate('click')
    expect(wrapper.state('dialogOpen')).toBe(true)
  }) */
});
