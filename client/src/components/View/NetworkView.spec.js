/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { NetworkView } from './NetworkView';

const setup = () => {
  const props = {
    peerList: []
  };

  const wrapper = shallow(<NetworkView {...props} />);

  return {
    props,
    wrapper
  };
};

describe('NetworkView', () => {
  test('NetworkView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
