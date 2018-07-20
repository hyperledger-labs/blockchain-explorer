/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { ChaincodeModal } from './ChaincodeModal';

const setup = () => {
  const props = {
    chaincode: {
      chaincodename: 'mycc',
      channelName: 'mychannel',
      path: 'github.com/chaincode/chaincode_example02/go/',
      source: 'Location not found',
      txCount: 32,
      version: '1.0',
    },
    classes: {
      container: 'ChaincodeModal-container-89',
      container1: 'ChaincodeModal-container1-90',
    },
  };

  const wrapper = shallow(<ChaincodeModal {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('ChaincodeModal', () => {
  test('ChaincodeModal component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
