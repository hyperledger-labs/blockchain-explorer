/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import OrgPieChart from './OrgPieChart';

const setup = () => {
  const props = {
    txByOrg: [
      {
        count: "3",
        creator_msp_id: "OrdererMSP"
      },
      {
        count: "1",
        creator_msp_id: "Org2MSP"
      },
      {
        count: "100",
        creator_msp_id: "Org1MSP"
      }
    ]
  }
  const wrapper = shallow(<OrgPieChart {...props} />);

  return {
    props,
    wrapper
  }
}

describe('OrgPieChart', () => {
  test("OrgPieChart component should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('orgDataSetup gets called in componentWillReceiveProps when a new prop is set', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance()
    const spy = jest.spyOn(instance, 'orgDataSetup');
    const txByOrg = [
        {
          count: "3",
          creator_msp_id: "OrdererMSP"
        },
        {
          count: "1",
          creator_msp_id: "Org2MSP"
        },
        {
          count: "110",
          creator_msp_id: "Org1MSP"
        }
      ]

    wrapper.setProps({ txByOrg });
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
