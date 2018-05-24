/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Chaincodes from "./Chaincodes";
import ReactTable from "react-table";

jest.useFakeTimers();

const setup = () => {
  const props = {
    chaincodes: [
      {
        chaincodename: "mycc",
        channelName: "mychannel",
        path: '"github.com/chaincode/chaincode_example02/go/"',
        txCount: 33,
        version: "1.0"
      }
    ],
    channel: {
      currentChannel: "mychannel"
    },
    countHeader: {
      chaincodeCount: "1",
      latestBlock: 20,
      peerCount: "4",
      txCount: "36"
    },
    getChaincodes: jest.fn()
  };

  const wrapper = mount(<Chaincodes {...props} />);

  return {
    props,
    wrapper
  };
};

describe("Chaincodes", () => {
  test('setInterval called', () => {
    const { wrapper, props } = setup();
    expect(setInterval).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(props.getChaincodes).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 60000);
  });

  test("Chaincodes and ReactTable components should render", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(ReactTable).exists()).toBe(true);
  });

  test("Table displays chaincode data", () => {
    const { wrapper } = setup();
    // Chaincode Name
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('mycc')).exists()).toBe(true);
    // Channel Name
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('mychannel')).exists()).toBe(true);
    // Path
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('"github.com/chaincode/chaincode_example02/go/"')).exists()).toBe(true);
    //Transition Count
    expect(wrapper.find('TdComponent').findWhere(n => n.contains(33)).exists()).toBe(true);
    //Version
    expect(wrapper.find('TdComponent').findWhere(n => n.contains('1.0')).exists()).toBe(true);
  });

  test("componentWillReceiveProps sets the state of chaincodeCount", () => {
    const { wrapper } = setup();
    wrapper.instance().componentWillReceiveProps()
    wrapper.update()
    expect(wrapper.state('chaincodeCount')).toBe('1');
  });

  test("Simulate Chaincode Name filterMethod should have one result when given a value of mycc", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '0-chaincodename').find('input').simulate('change', {target: {value: 'mycc'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test("Simulate Channel Name filterMethod should have one result when given a value of mychannel", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '1-channelName').find('input').simulate('change', {target: {value: 'mychannel'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test("Simulate Path filterMethod should have one result when given a value of github", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '2-path').find('input').simulate('change', {target: {value: 'github'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test("Simulate Transaction Count filterMethod should have one result when given a value of 33", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '3-txCount').find('input').simulate('change', {target: {value: '33'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });

  test("Simulate Version filterMethod should have one result when given a value of 1", () => {
    const { wrapper } = setup();
    wrapper.find('ThComponent').findWhere(n => n.key() === '4-version').find('input').simulate('change', {target: {value: '1'}});
    expect(wrapper.find(ReactTable).find('TrGroupComponent').length).toBe(1);
  });
});
