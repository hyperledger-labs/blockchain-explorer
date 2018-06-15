/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import TimelineStream from "./TimelineStream";

const setup = () => {
  const props = {
    notifications: [
      {
        datahash: "07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7",
        time: "2018-05-30T21:15:09.000Z",
        title: "Block 12 Added",
        txcount: 3,
        type: 'block'
      }
    ]
  }

  const wrapper = shallow(<TimelineStream {... props} />);

  return {
    props,
    wrapper
  }
};

describe('TimelineStream', () => {
  test("TimelineStream component should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
