/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { LandingPage } from './LandingPage';

const setup = () => {
  const props = {
    channel: { currentChannel: 'mychannel' },
    getCountHeader: jest.fn(),
    getTxPerHour: jest.fn(),
    getTxPerMin: jest.fn(),
    getBlocksPerHour: jest.fn(),
    getBlocksPerMin: jest.fn(),
    getTransactionList: jest.fn(),
    getBlockList: jest.fn(),
    getPeerList: jest.fn(),
    getChaincodes: jest.fn(),
    getTxByOrg: jest.fn(),
    getPeerStatus: jest.fn()
  }

  const wrapper = shallow(<LandingPage {...props} />);

  return {
    props,
    wrapper
  }
};

describe('LandingPage', () => {
  test('LandingPage component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('component receives new channel', () => {
    const { wrapper, props } = setup();
    const newChannel = { currentChannel: 'newChannel' };
    wrapper.setProps({ channel: newChannel })
    expect(props.getTxByOrg).toHaveBeenCalled();
    expect(props.getChaincodes).toHaveBeenCalled();
    expect(props.getPeerList).toHaveBeenCalled();
    expect(props.getBlockList).toHaveBeenCalled();
    expect(props.getTransactionList).toHaveBeenCalled();
    expect(props.getBlocksPerMin).toHaveBeenCalled();
    expect(props.getBlocksPerHour).toHaveBeenCalled();
    expect(props.getTxPerHour).toHaveBeenCalled();
    expect(props.getTxPerMin).toHaveBeenCalled();
    expect(props.getCountHeader).toHaveBeenCalled();
  })

  test('component receives new channel', () => {
    const { wrapper, props } = setup();
    const newChannel = { currentChannel: 'newChannel' };
    wrapper.setProps({ channel: props.channel })
    expect(props.getTxByOrg).not.toHaveBeenCalled();
    expect(props.getChaincodes).not.toHaveBeenCalled();
    expect(props.getPeerList).not.toHaveBeenCalled();
    expect(props.getBlockList).not.toHaveBeenCalled();
    expect(props.getTransactionList).not.toHaveBeenCalled();
    expect(props.getBlocksPerMin).not.toHaveBeenCalled();
    expect(props.getBlocksPerHour).not.toHaveBeenCalled();
    expect(props.getTxPerHour).not.toHaveBeenCalled();
    expect(props.getTxPerMin).not.toHaveBeenCalled();
    expect(props.getCountHeader).not.toHaveBeenCalled();
  })
});
