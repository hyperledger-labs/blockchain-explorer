/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Peers from "./Peers";
import ReactTable from 'react-table';

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
  };

  const wrapper = mount(<Peers {...props} />);

  return {
    props,
    wrapper
  }
};

describe("Peers", () => {
  test("Peers and ReactTable components should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(ReactTable).exists()).toBe(true);
  });

  test("Table displays peer data", () => {
    const { wrapper } = setup();
    // Peer Names
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('peer0.org1.example.com')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('peer1.org1.example.com')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('peer0.org2.example.com')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('peer1.org2.example.com')).exists()).toBe(true);
    // Request Url
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('grpcs://127.0.0.1:7051')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('grpcs://127.0.0.1:8051')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('grpcs://127.0.0.1:9051')).exists()).toBe(true);
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('grpcs://127.0.0.1:10051')).exists()).toBe(true);
  });

  test("Simulate Peer Name filterMethod should have two result when given a value of peer0", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '0-server_hostname').find('input').simulate('change', {target: {value: 'peer0'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(2);
  });

  test("Simulate Request Url filterMethod should have one result when given a value of 9", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '1-requests').find('input').simulate('change', {target: {value: '9'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });
});
