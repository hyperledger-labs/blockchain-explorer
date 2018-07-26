/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsPanel } from './NotificationsPanel';

const setup = () => {
  const props = {
    notifications: [
      {
        title: 'Block 12 Added',
        type: 'block',
        message: 'Block 12 established with 3 tx',
        time: '2018-05-30T21:15:09.000Z',
        txcount: 3,
        datahash:
          '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7'
      }
    ],
    classes: {
      avatarBlue: 'NotificationsPanel-avatarBlue-80',
      root: 'NotificationsPanel-root-79'
    }
  };
  const wrapper = shallow(<NotificationsPanel {...props} />);

  return {
    props,
    wrapper
  };
};

describe('NotificationsPanel', () => {
  test('NotificationsPanel component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('avatarIcon returns avatar', () => {
    const { wrapper, props } = setup();
    expect(
      wrapper.instance().avatarIcon('block', props.classes).props.className
    ).toBe('NotificationsPanel-avatarBlue-80');
    expect(
      wrapper.instance().avatarIcon('notBlock', props.classes).props.className
    ).toBe(undefined);
  });

  test('no notifications', () => {
    const { wrapper } = setup();
    wrapper.setProps({ notifications: [] });
    expect(
      wrapper.find('WithStyles(Typography)').contains('NO NOTIFICATIONS')
    ).toBe(true);
  });
});
