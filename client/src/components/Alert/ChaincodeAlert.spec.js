/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { ChaincodeAlert } from './ChaincodeAlert';

const setup = () => {
  const props = {
    payload: {
      path: 'example_cc/',
      name: 'test',
      version: '0.0.1',
      type: 'Go',
      peer: 'peer0.org1.example.com'
    },
    reqType: 'install',
    handleClose: jest.fn(),
    classes: {
      progress: {
        'text-align': 'center'
      },
      button: {
        display: 'block'
      }
    }
  };

  const wrapper = shallow(<ChaincodeAlert {...props} />);

  return {
    props,
    wrapper
  };
};

describe('ChaincodeAlert', () => {
  test('ChaincodeAlert component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('ChaincodeAlert button click evnet', () => {
    const { wrapper, props } = setup();
    wrapper.setState({ isFinish: true });
    wrapper.find('.btn-confirm').simulate('click');
    expect(props.handleClose).toHaveBeenCalled();
  });
});
