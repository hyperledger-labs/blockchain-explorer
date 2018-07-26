/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import ChannelForm from './ChannelForm';

const setup = () => {
  const wrapper = shallow(<ChannelForm />);

  return {
    wrapper
  };
};

describe('ChannelForm', () => {
  test('ChannelForm component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
