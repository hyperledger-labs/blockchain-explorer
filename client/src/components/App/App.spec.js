/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './App';

jest.useFakeTimers();

const setup = () => {
  const wrapper = shallow(<App />);

  return {
    wrapper,
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

  test('if loading is false MultiThemeProvider should render', () => {
    const { wrapper } = setup();
    wrapper.setState({ loading: false });
    wrapper.update();
    expect(wrapper.find(MuiThemeProvider).exists()).toBe(true);
  });
});
