/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { ChaincodeView } from './ChaincodeView';

const setup = () => {
  const props = {
    chaincodeList: [
      {
        chaincodename: 'mycc',
        channelName: 'mychannel',
        path: 'github.com/chaincode/chaincode_example02/go/',
        source: 'Location not found',
        txCount: 32,
        version: '1.0',
      },
    ],
  };

  const wrapper = shallow(<ChaincodeView {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('ChaincodeView', () => {
  test('ChaincodeView component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
