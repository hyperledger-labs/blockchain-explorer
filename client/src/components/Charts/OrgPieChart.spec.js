/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { OrgPieChart } from './OrgPieChart';

const setup = () => {
  const props = {
    classes: {
      chart: 'chart',
      container: 'container',
    },
    transactionByOrg: [
      {
        count: '3',
        creator_msp_id: 'OrdererMSP',
      },
      {
        count: '1',
        creator_msp_id: 'Org2MSP',
      },
      {
        count: '100',
        creator_msp_id: 'Org1MSP',
      },
    ],
  };
  const wrapper = shallow(<OrgPieChart {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('OrgPieChart', () => {
  test('OrgPieChart component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('orgDataSetup gets called in componentWillReceiveProps when a new prop is set', () => {
    const { wrapper } = setup();
    const instance = wrapper.instance();
    const spy = jest.spyOn(instance, 'orgDataSetup');
    const transactionByOrg = [
      {
        count: '3',
        creator_msp_id: 'OrdererMSP',
      },
      {
        count: '1',
        creator_msp_id: 'Org2MSP',
      },
      {
        count: '110',
        creator_msp_id: 'Org1MSP',
      },
    ];

    wrapper.setProps({ transactionByOrg });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
