/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { Main } from './Main';

const setup = () => {
  const wrapper = shallow(<Main />);

  return {
    wrapper
  }
};

describe('Main', () => {
  test('Main component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
