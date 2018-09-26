/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { ChannelsView } from './ChannelsView';

const setup = () => {
  const props = {
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
    getChannels: jest.fn(),
  };

  const wrapper = shallow(<ChannelsView {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('ChannelsView', () => {
  test('ChannelsView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
