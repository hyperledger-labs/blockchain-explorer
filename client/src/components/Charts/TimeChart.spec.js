/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { TimeChart } from './TimeChart';

const setup = () => {
  const props = {
    classes: {
      content: 'content'
    },
    chartData: {
      dataMax: 10,
      displayData: [
        { datetime: '2018-05-13T17:00:00.000Z', count: '10' },
        { datetime: '2018-05-13T18:00:00.000Z', count: '0' },
        { datetime: '2018-05-13T19:00:00.000Z', count: '0' },
        { datetime: '2018-05-13T20:00:00.000Z', count: '0' },
        { datetime: '2018-05-13T21:00:00.000Z', count: '0' },
        { datetime: '2018-05-13T22:00:00.000Z', count: '0' },
        { datetime: '2018-05-13T23:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T00:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T01:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T02:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T03:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T04:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T05:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T06:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T07:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T08:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T09:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T10:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T11:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T12:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T13:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T14:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T15:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T16:00:00.000Z', count: '0' },
        { datetime: '2018-05-14T17:00:00.000Z', count: '0' }
      ]
    }
  };

  const wrapper = shallow(<TimeChart {...props} />);

  return {
    props,
    wrapper
  };
};

describe('TimeChart', () => {
  test('TimeChart component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
