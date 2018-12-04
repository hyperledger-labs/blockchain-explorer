/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { ChaincodeForm } from './ChaincodeForm';

const setup = () => {
  const props = {
    handleDialog: jest.fn(),
    peerList: [
      {
        requests: 'grpcs://127.0.0.1:7051',
        server_hostname: 'peer0.org1.example.com'
      }
    ],
    classes: {
      container: {
        border: '3px solid #afeeee'
      },
      container1: {
        display: 'flex'
      },

      textField: {
        width: '100%'
      },
      button: {
        'background-color': '#afeeee'
      }
    }
  };
  const wrapper = shallow(<ChaincodeForm {...props} />);

  return {
    props,
    wrapper
  };
};

describe('ChaincodeForm', () => {
  test('ChaincodeForm component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  //Add test case for handleChange, handleSubmmit
  test('handleChange changes state', () => {
    const { wrapper } = setup();
    const instance = wrapper.instance();
    const versionEvt = {
      target: {
        name: 'version',
        value: '0.0.1'
      }
    };
    const event = versionEvt;
    instance.handleChange(event);
    expect(wrapper.state('request')).toMatchObject({ version: '0.0.1' });
  });

  test('handleSubmit: install chaincode', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance();
    const versionEvt = {
      preventDefault: () => {}
    };
    instance.handleSubmit(versionEvt);
    expect(props.handleDialog).toHaveBeenCalled();
  });
});
