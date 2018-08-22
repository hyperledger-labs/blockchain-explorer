/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { LandingPage } from './LandingPage';

const setup = () => {
  const props = {
    classes: {
      background: 'background',
      content: 'content'
    },
    currentChannel: 'mychannel',
    getBlockList: jest.fn(),
    getBlocksPerHour: jest.fn(),
    getBlocksPerMin: jest.fn(),
    getChaincodeList: jest.fn(),
    getChannel: jest.fn(),
    getChannelList: jest.fn(),
    getChannels: jest.fn(),
    getDashStats: jest.fn(),
    getPeerList: jest.fn(),
    getPeerStatus: jest.fn(),
    getTransactionByOrg: jest.fn(),
    getTransactionList: jest.fn(),
    getTransactionPerHour: jest.fn(),
    getTransactionPerMin: jest.fn(),
    updateLoadStatus: jest.fn()
  };

  const wrapper = shallow(<LandingPage {...props} />);

  return {
    props,
    wrapper
  };
};

describe('LandingPage', () => {
  test('LandingPage component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  /*   test('component receives new channel', () => {
    const { wrapper, props } = setup();
    const newChannel = { currentChannel: 'newChannel' };
    wrapper.setProps({ channel: newChannel })
    expect(props.getBlockList).toHaveBeenCalled();
    expect(props.getBlocksPerHour).toHaveBeenCalled();
    expect(props.getBlocksPerMin).toHaveBeenCalled();
    expect(props.getChaincodeList).toHaveBeenCalled();
    expect(props.getChannels).toHaveBeenCalled();
    expect(props.getDashStats).toHaveBeenCalled();
    expect(props.getPeerList).toHaveBeenCalled();
    expect(props.getPeerStatus).toHaveBeenCalled();
    expect(props.getTransactionByOrg).toHaveBeenCalled();
    expect(props.getTransactionList).toHaveBeenCalled();
    expect(props.getTransactionPerHour).toHaveBeenCalled();
    expect(props.getTransactionPerMin).toHaveBeenCalled();
  }) */

  /*   test('component receives the same channel', () => {
    const { wrapper, props } = setup();
    wrapper.setProps({ channel: props.channel })
    expect(props.getBlockList).not.toHaveBeenCalled();
    expect(props.getBlocksPerHour).not.toHaveBeenCalled();
    expect(props.getBlocksPerMin).not.toHaveBeenCalled();
    expect(props.getChaincodeList).not.toHaveBeenCalled();
    expect(props.getDashStats).not.toHaveBeenCalled();
    expect(props.getPeerList).not.toHaveBeenCalled();
    expect(props.getPeerStatus).not.toHaveBeenCalled();
    expect(props.getTransactionByOrg).not.toHaveBeenCalled();
    expect(props.getTransactionList).not.toHaveBeenCalled();
    expect(props.getTransactionPerHour).not.toHaveBeenCalled();
    expect(props.getTransactionPerMin).not.toHaveBeenCalled();
  }) */
});
