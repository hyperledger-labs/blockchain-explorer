/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { ChartStats } from  './ChartStats';

jest.useFakeTimers();

const setup = () => {
  const props = {
    blockPerHour: {
      blockPerHour: {
        "status":200,"rows":[{"datetime":"2018-05-13T17:00:00.000Z","count":"0"},{"datetime":"2018-05-13T18:00:00.000Z","count":"0"},{"datetime":"2018-05-13T19:00:00.000Z","count":"0"},{"datetime":"2018-05-13T20:00:00.000Z","count":"0"},{"datetime":"2018-05-13T21:00:00.000Z","count":"0"},{"datetime":"2018-05-13T22:00:00.000Z","count":"0"},{"datetime":"2018-05-13T23:00:00.000Z","count":"0"},{"datetime":"2018-05-14T00:00:00.000Z","count":"0"},{"datetime":"2018-05-14T01:00:00.000Z","count":"0"},{"datetime":"2018-05-14T02:00:00.000Z","count":"0"},{"datetime":"2018-05-14T03:00:00.000Z","count":"0"},{"datetime":"2018-05-14T04:00:00.000Z","count":"0"},{"datetime":"2018-05-14T05:00:00.000Z","count":"0"},{"datetime":"2018-05-14T06:00:00.000Z","count":"0"},{"datetime":"2018-05-14T07:00:00.000Z","count":"0"},{"datetime":"2018-05-14T08:00:00.000Z","count":"0"},{"datetime":"2018-05-14T09:00:00.000Z","count":"0"},{"datetime":"2018-05-14T10:00:00.000Z","count":"0"},{"datetime":"2018-05-14T11:00:00.000Z","count":"0"},{"datetime":"2018-05-14T12:00:00.000Z","count":"0"},{"datetime":"2018-05-14T13:00:00.000Z","count":"0"},{"datetime":"2018-05-14T14:00:00.000Z","count":"0"},{"datetime":"2018-05-14T15:00:00.000Z","count":"0"},{"datetime":"2018-05-14T16:00:00.000Z","count":"0"},{"datetime":"2018-05-14T17:00:00.000Z","count":"0"}]
      }
    },
    blockPerMin: {
      blockPerMin: {
        "status":200,"rows":[{"datetime":"2018-05-14T16:23:00.000Z","count":"0"},{"datetime":"2018-05-14T16:24:00.000Z","count":"0"},{"datetime":"2018-05-14T16:25:00.000Z","count":"0"},{"datetime":"2018-05-14T16:26:00.000Z","count":"0"},{"datetime":"2018-05-14T16:27:00.000Z","count":"0"},{"datetime":"2018-05-14T16:28:00.000Z","count":"0"},{"datetime":"2018-05-14T16:29:00.000Z","count":"0"},{"datetime":"2018-05-14T16:30:00.000Z","count":"0"},{"datetime":"2018-05-14T16:31:00.000Z","count":"0"},{"datetime":"2018-05-14T16:32:00.000Z","count":"0"},{"datetime":"2018-05-14T16:33:00.000Z","count":"0"},{"datetime":"2018-05-14T16:34:00.000Z","count":"0"},{"datetime":"2018-05-14T16:35:00.000Z","count":"0"},{"datetime":"2018-05-14T16:36:00.000Z","count":"0"},{"datetime":"2018-05-14T16:37:00.000Z","count":"0"},{"datetime":"2018-05-14T16:38:00.000Z","count":"0"},{"datetime":"2018-05-14T16:39:00.000Z","count":"0"},{"datetime":"2018-05-14T16:40:00.000Z","count":"0"},{"datetime":"2018-05-14T16:41:00.000Z","count":"0"},{"datetime":"2018-05-14T16:42:00.000Z","count":"0"},{"datetime":"2018-05-14T16:43:00.000Z","count":"0"},{"datetime":"2018-05-14T16:44:00.000Z","count":"0"},{"datetime":"2018-05-14T16:45:00.000Z","count":"0"},{"datetime":"2018-05-14T16:46:00.000Z","count":"0"},{"datetime":"2018-05-14T16:47:00.000Z","count":"0"},{"datetime":"2018-05-14T16:48:00.000Z","count":"0"},{"datetime":"2018-05-14T16:49:00.000Z","count":"0"},{"datetime":"2018-05-14T16:50:00.000Z","count":"0"},{"datetime":"2018-05-14T16:51:00.000Z","count":"0"},{"datetime":"2018-05-14T16:52:00.000Z","count":"0"},{"datetime":"2018-05-14T16:53:00.000Z","count":"0"},{"datetime":"2018-05-14T16:54:00.000Z","count":"0"},{"datetime":"2018-05-14T16:55:00.000Z","count":"0"},{"datetime":"2018-05-14T16:56:00.000Z","count":"0"},{"datetime":"2018-05-14T16:57:00.000Z","count":"0"},{"datetime":"2018-05-14T16:58:00.000Z","count":"0"},{"datetime":"2018-05-14T16:59:00.000Z","count":"0"},{"datetime":"2018-05-14T17:00:00.000Z","count":"0"},{"datetime":"2018-05-14T17:01:00.000Z","count":"0"},{"datetime":"2018-05-14T17:02:00.000Z","count":"0"},{"datetime":"2018-05-14T17:03:00.000Z","count":"0"},{"datetime":"2018-05-14T17:04:00.000Z","count":"0"},{"datetime":"2018-05-14T17:05:00.000Z","count":"0"},{"datetime":"2018-05-14T17:06:00.000Z","count":"0"},{"datetime":"2018-05-14T17:07:00.000Z","count":"0"},{"datetime":"2018-05-14T17:08:00.000Z","count":"0"},{"datetime":"2018-05-14T17:09:00.000Z","count":"0"},{"datetime":"2018-05-14T17:10:00.000Z","count":"0"},{"datetime":"2018-05-14T17:11:00.000Z","count":"0"},{"datetime":"2018-05-14T17:12:00.000Z","count":"0"},{"datetime":"2018-05-14T17:13:00.000Z","count":"0"},{"datetime":"2018-05-14T17:14:00.000Z","count":"0"},{"datetime":"2018-05-14T17:15:00.000Z","count":"0"},{"datetime":"2018-05-14T17:16:00.000Z","count":"0"},{"datetime":"2018-05-14T17:17:00.000Z","count":"0"},{"datetime":"2018-05-14T17:18:00.000Z","count":"0"},{"datetime":"2018-05-14T17:19:00.000Z","count":"0"},{"datetime":"2018-05-14T17:20:00.000Z","count":"0"},{"datetime":"2018-05-14T17:21:00.000Z","count":"0"},{"datetime":"2018-05-14T17:22:00.000Z","count":"0"},{"datetime":"2018-05-14T17:23:00.000Z","count":"0"}]
      }
    },
    txPerHour: {
      txPerHour: {
        "status":200,"rows":[{"datetime":"2018-05-13T17:00:00.000Z","count":"0"},{"datetime":"2018-05-13T18:00:00.000Z","count":"0"},{"datetime":"2018-05-13T19:00:00.000Z","count":"0"},{"datetime":"2018-05-13T20:00:00.000Z","count":"0"},{"datetime":"2018-05-13T21:00:00.000Z","count":"0"},{"datetime":"2018-05-13T22:00:00.000Z","count":"0"},{"datetime":"2018-05-13T23:00:00.000Z","count":"0"},{"datetime":"2018-05-14T00:00:00.000Z","count":"0"},{"datetime":"2018-05-14T01:00:00.000Z","count":"0"},{"datetime":"2018-05-14T02:00:00.000Z","count":"0"},{"datetime":"2018-05-14T03:00:00.000Z","count":"0"},{"datetime":"2018-05-14T04:00:00.000Z","count":"0"},{"datetime":"2018-05-14T05:00:00.000Z","count":"0"},{"datetime":"2018-05-14T06:00:00.000Z","count":"0"},{"datetime":"2018-05-14T07:00:00.000Z","count":"0"},{"datetime":"2018-05-14T08:00:00.000Z","count":"0"},{"datetime":"2018-05-14T09:00:00.000Z","count":"0"},{"datetime":"2018-05-14T10:00:00.000Z","count":"0"},{"datetime":"2018-05-14T11:00:00.000Z","count":"0"},{"datetime":"2018-05-14T12:00:00.000Z","count":"0"},{"datetime":"2018-05-14T13:00:00.000Z","count":"0"},{"datetime":"2018-05-14T14:00:00.000Z","count":"0"},{"datetime":"2018-05-14T15:00:00.000Z","count":"0"},{"datetime":"2018-05-14T16:00:00.000Z","count":"0"},{"datetime":"2018-05-14T17:00:00.000Z","count":"0"}]
      }
    },
    txPerMin: {
      txPerMin: {
        "status":200,"rows":[{"datetime":"2018-05-14T16:23:00.000Z","count":"0"},{"datetime":"2018-05-14T16:24:00.000Z","count":"0"},{"datetime":"2018-05-14T16:25:00.000Z","count":"0"},{"datetime":"2018-05-14T16:26:00.000Z","count":"0"},{"datetime":"2018-05-14T16:27:00.000Z","count":"0"},{"datetime":"2018-05-14T16:28:00.000Z","count":"0"},{"datetime":"2018-05-14T16:29:00.000Z","count":"0"},{"datetime":"2018-05-14T16:30:00.000Z","count":"0"},{"datetime":"2018-05-14T16:31:00.000Z","count":"0"},{"datetime":"2018-05-14T16:32:00.000Z","count":"0"},{"datetime":"2018-05-14T16:33:00.000Z","count":"0"},{"datetime":"2018-05-14T16:34:00.000Z","count":"0"},{"datetime":"2018-05-14T16:35:00.000Z","count":"0"},{"datetime":"2018-05-14T16:36:00.000Z","count":"0"},{"datetime":"2018-05-14T16:37:00.000Z","count":"0"},{"datetime":"2018-05-14T16:38:00.000Z","count":"0"},{"datetime":"2018-05-14T16:39:00.000Z","count":"0"},{"datetime":"2018-05-14T16:40:00.000Z","count":"0"},{"datetime":"2018-05-14T16:41:00.000Z","count":"0"},{"datetime":"2018-05-14T16:42:00.000Z","count":"0"},{"datetime":"2018-05-14T16:43:00.000Z","count":"0"},{"datetime":"2018-05-14T16:44:00.000Z","count":"0"},{"datetime":"2018-05-14T16:45:00.000Z","count":"0"},{"datetime":"2018-05-14T16:46:00.000Z","count":"0"},{"datetime":"2018-05-14T16:47:00.000Z","count":"0"},{"datetime":"2018-05-14T16:48:00.000Z","count":"0"},{"datetime":"2018-05-14T16:49:00.000Z","count":"0"},{"datetime":"2018-05-14T16:50:00.000Z","count":"0"},{"datetime":"2018-05-14T16:51:00.000Z","count":"0"},{"datetime":"2018-05-14T16:52:00.000Z","count":"0"},{"datetime":"2018-05-14T16:53:00.000Z","count":"0"},{"datetime":"2018-05-14T16:54:00.000Z","count":"0"},{"datetime":"2018-05-14T16:55:00.000Z","count":"0"},{"datetime":"2018-05-14T16:56:00.000Z","count":"0"},{"datetime":"2018-05-14T16:57:00.000Z","count":"0"},{"datetime":"2018-05-14T16:58:00.000Z","count":"0"},{"datetime":"2018-05-14T16:59:00.000Z","count":"0"},{"datetime":"2018-05-14T17:00:00.000Z","count":"0"},{"datetime":"2018-05-14T17:01:00.000Z","count":"0"},{"datetime":"2018-05-14T17:02:00.000Z","count":"0"},{"datetime":"2018-05-14T17:03:00.000Z","count":"0"},{"datetime":"2018-05-14T17:04:00.000Z","count":"0"},{"datetime":"2018-05-14T17:05:00.000Z","count":"0"},{"datetime":"2018-05-14T17:06:00.000Z","count":"0"},{"datetime":"2018-05-14T17:07:00.000Z","count":"0"},{"datetime":"2018-05-14T17:08:00.000Z","count":"0"},{"datetime":"2018-05-14T17:09:00.000Z","count":"0"},{"datetime":"2018-05-14T17:10:00.000Z","count":"0"},{"datetime":"2018-05-14T17:11:00.000Z","count":"0"},{"datetime":"2018-05-14T17:12:00.000Z","count":"0"},{"datetime":"2018-05-14T17:13:00.000Z","count":"0"},{"datetime":"2018-05-14T17:14:00.000Z","count":"0"},{"datetime":"2018-05-14T17:15:00.000Z","count":"0"},{"datetime":"2018-05-14T17:16:00.000Z","count":"0"},{"datetime":"2018-05-14T17:17:00.000Z","count":"0"},{"datetime":"2018-05-14T17:18:00.000Z","count":"0"},{"datetime":"2018-05-14T17:19:00.000Z","count":"0"},{"datetime":"2018-05-14T17:20:00.000Z","count":"0"},{"datetime":"2018-05-14T17:21:00.000Z","count":"0"},{"datetime":"2018-05-14T17:22:00.000Z","count":"0"},{"datetime":"2018-05-14T17:23:00.000Z","count":"0"}]
      }
    },
    getBlocksPerMin: jest.fn(),
    getBlocksPerHour: jest.fn(),
    getTxPerMin: jest.fn(),
    getTxPerHour: jest.fn(),
    channel: { currentChammel: 'mychannel'}
  }

  const wrapper = shallow(<ChartStats {... props}/>);

  return {
    props,
    wrapper
  }
};

describe('ChartStats', () => {
  test('setInterval called', () => {
    const { wrapper, props } = setup();
    expect(setInterval).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(props.getBlocksPerHour).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 6000);
  });

  test("ChartStats component should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test("Nav tabs toggle to the corresponding state", () => {
    const { wrapper } = setup();
    expect(wrapper.state('activeTab')).toBe('1')
    wrapper.find('NavLink').findWhere(n => n.contains('BLOCKS / MIN')).first().simulate('click')
    expect(wrapper.state('activeTab')).toBe('2')
    wrapper.find('NavLink').findWhere(n => n.contains('TX / HOUR')).first().simulate('click')
    expect(wrapper.state('activeTab')).toBe('3')
    wrapper.find('NavLink').findWhere(n => n.contains('TX / MIN')).first().simulate('click')
    expect(wrapper.state('activeTab')).toBe('4')
    wrapper.find('NavLink').findWhere(n => n.contains('BLOCKS / HOUR')).first().simulate('click')
    expect(wrapper.state('activeTab')).toBe('1')
  });

  test('timeDataSetup should return new dataMax', () => {
    const { wrapper } = setup();
    const data = [{"datetime":"2018-05-13T17:00:00.000Z","count":"10"}]
    expect(wrapper.instance().timeDataSetup(data).dataMax).toBe(15)
  })

  test('timeDataSetup should return same dataMax', () => {
    const { wrapper } = setup();
    const data = [{"datetime":"2018-05-13T17:00:00.000Z","count":"0"}]
    expect(wrapper.instance().timeDataSetup(data).dataMax).toBe(5)
  })
});
