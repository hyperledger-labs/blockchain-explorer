/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { ChaincodeModal } from './ChaincodeModal';

const setup = () => {
  const props = {
    classes: {
      code: 'code',
      source: 'source',
      cubeIcon: 'cubeIcon'
    },
    chaincode: {
      chaincodename: 'mycc',
      channelName: 'mychannel',
      path: 'github.com/chaincode/chaincode_example02/go/',
      source: 'Location not found',
      txCount: 32,
      version: '1.0'
    }
  };

  const wrapper = shallow(<ChaincodeModal {...props} />);

  return {
    props,
    wrapper
  };
};

describe('ChaincodeModal', () => {
  test('ChaincodeModal component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
