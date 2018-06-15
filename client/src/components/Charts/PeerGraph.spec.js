/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import PeerGraph from './PeerGraph';

const setup = () => {
  const props = {
    peerList: [
      {
        requests: "grpcs://127.0.0.1:7051",
        server_hostname: "peer0.org1.example.com"
      },
      {
        requests: "grpcs://127.0.0.1:8051",
        server_hostname: "peer1.org1.example.com"
      },
      {
        requests: "grpcs://127.0.0.1:9051",
        server_hostname: "peer0.org2.example.com"
      },
      {
        requests: "grpcs://127.0.0.1:10051",
        server_hostname: "peer1.org2.example.com"
      }
    ]
  }

  const wrapper = shallow(<PeerGraph {...props} />);

  return{
    props,
    wrapper }
}

describe('PeerGraph', () => {
  test("PeerGraph component should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });
});
