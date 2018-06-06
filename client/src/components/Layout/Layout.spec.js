/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Layout from "./Layout";

const setup = () => {
  const wrapper = shallow(<Layout />);

  return {
    wrapper
  }
};

describe('Layout', () => {
  test("Layout component should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
