/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Channels from './Channels';
import ReactTable from 'react-table';

jest.useFakeTimers();

const setup = () => {

  const props = {
    channels: [
      {
        blocks: 5,
        channel_hash: '0bc9fb4bca66ff0583e39e888eebdf9e01f976d292af3e9deff7d3199ecf3977',
        channelname: 'mychannel',
        createdat: '2018-05-30T20:56:47.795Z',
        id: 3,
        transactions: 5
      }
    ],
    getChannels: jest.fn()
  }

  const wrapper = mount(<Channels {...props} />);

  return {
    props,
    wrapper
  }
};

describe('Channels', () => {
  test('Channels component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('componentWillReceiveProps gets a channel', () => {
    const { wrapper, props } = setup();
    jest.runOnlyPendingTimers();
    expect(props.getChannels).toHaveBeenCalled();
  })

  test('Simulate ID filterMethod should have one result when given a value of 3', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '0-id').find('input').simulate('change', { target: { value: '3' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Channel Name filterMethod should have one result when given a value of my', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '1-channelname').find('input').simulate('change', { target: { value: 'my' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Channel Hash filterMethod should have one result when given a value of 0bc', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '2-channel_hash').find('input').simulate('change', { target: { value: '0bc' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Blocks filterMethod should have one result when given a value of 5', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '3-blocks').find('input').simulate('change', { target: { value: '5' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Transactions filterMethod should have one result when given a value of 5', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '4-transactions').find('input').simulate('change', { target: { value: '5' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Created At filterMethod should have one result when given a value of 2018', () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '5-createdat').find('input').simulate('change', { target: { value: '2018' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });
});
