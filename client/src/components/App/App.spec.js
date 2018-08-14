/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { App } from './App';
import Header from '../Header';

jest.useFakeTimers();

const setup = () => {
  const wrapper = shallow(<App classes={{ app: 'app' }} />);

  return {
    wrapper
  };
};

describe('App', () => {
  /*  test('setTimeout called', () => {
    const { wrapper } = setup();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 6000);
  }); */

  test('App component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('if loading is false Header should render', () => {
    const { wrapper } = setup();
    wrapper.setState({ loading: false });
    wrapper.update();
    expect(wrapper.find(Header).exists()).toBe(true);
  });
});
