/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import ReactTable from '../Styled/Table';
import Channels from './Channels';

jest.useFakeTimers();

const setup = () => {
  const props = {
    channels: [
      {
        blocks: 5,
        channelname: 'mychannel',
        createdat: '2018-05-30T20:56:47.795Z',
        id: 3,
        transactions: 5
      }
    ]
  };

  const wrapper = mount(<Channels {...props} />);

  return {
    props,
    wrapper
  };
};

describe('Channels', () => {
  test('Channels component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('Simulate ID filterMethod should have one result when given a value of 3', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '0-id')
      .find('input')
      .simulate('change', { target: { value: '3' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Channel Name filterMethod should have one result when given a value of my', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '1-channelname')
      .find('input')
      .simulate('change', { target: { value: 'my' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Blocks filterMethod should have one result when given a value of 5', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '2-blocks')
      .find('input')
      .simulate('change', { target: { value: '5' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Transactions filterMethod should have one result when given a value of 5', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '3-transactions')
      .find('input')
      .simulate('change', { target: { value: '5' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('Simulate Created At filterMethod should have one result when given a value of 2018', () => {
    const { wrapper } = setup();
    wrapper
      .find('ThComponent')
      .findWhere(n => n.key() === '4-createdat')
      .find('input')
      .simulate('change', { target: { value: '2018' } });
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test('pagination when channels is greater than 4', () => {
    const { wrapper, props } = setup();
    const { channels } = props;
    const channel = channels[0];
    const lotsOfChannels = [
      channel,
      channel,
      channel,
      channel,
      channel,
      channel
    ];
    expect(wrapper.find('.pagination-bottom').exists()).toBe(false);
    wrapper.setProps({ channels: lotsOfChannels });
    expect(wrapper.find('.pagination-bottom').exists()).toBe(true);
  });
});
