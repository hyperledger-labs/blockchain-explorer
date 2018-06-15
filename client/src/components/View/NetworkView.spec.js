/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { NetworkView } from './NetworkView';

const setup = () => {
  const props = {
    classes: {
      card: 'NetworkView-card-57',
      content: 'NetworkView-content-59',
      root: 'NetworkView-root-56',
      title: 'NetworkView-title-58'
    },
    peerList: []
  }

  const wrapper = shallow(<NetworkView {...props} />);

  return {
    props,
    wrapper
  }
};

describe('NetworkView', () => {
  test('NetworkView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
