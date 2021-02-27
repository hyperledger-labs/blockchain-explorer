/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { LandingPage } from './LandingPage';

Enzyme.configure({ adapter: new Adapter() });
const ComponentNaked = unwrap(LandingPage);

describe('<LandingPage />', () => {
	it('with shallow', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const { props } = setup();
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<LandingPage classes={{}} {...props} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const { props } = setup();
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<LandingPage classes={{}} {...props} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});

const setup = () => {
	const props = {
		classes: {
			background: 'background',
			content: 'content'
		},
		currentChannel: 'mychannel',
		getBlockActivity: jest.fn(),
		getBlockList: jest.fn(),
		getBlocksPerHour: jest.fn(),
		getBlocksPerMin: jest.fn(),
		getChaincodeList: jest.fn(),
		getChannel: jest.fn(),
		getChannelList: jest.fn(),
		getChannels: jest.fn(),
		getDashStats: jest.fn(),
		getPeerList: jest.fn(),
		getPeerStatus: jest.fn(),
		getTransactionByOrg: jest.fn(),
		getTransactionList: jest.fn(),
		getTransactionPerHour: jest.fn(),
		getTransactionPerMin: jest.fn(),
		updateLoadStatus: jest.fn(),
		userlist: jest.fn()
	};

	const wrapper = shallow(<LandingPage {...props} />);

	return {
		props,
		wrapper
	};
};

describe('LandingPage', () => {
	test('LandingPage component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	/*   test('component receives new channel', () => {
    const { wrapper, props } = setup();
    const newChannel = { currentChannel: 'newChannel' };
    wrapper.setProps({ channel: newChannel })
    expect(props.getBlockList).toHaveBeenCalled();
    expect(props.getBlocksPerHour).toHaveBeenCalled();
    expect(props.getBlocksPerMin).toHaveBeenCalled();
    expect(props.getChaincodeList).toHaveBeenCalled();
    expect(props.getChannels).toHaveBeenCalled();
    expect(props.getDashStats).toHaveBeenCalled();
    expect(props.getPeerList).toHaveBeenCalled();
    expect(props.getPeerStatus).toHaveBeenCalled();
    expect(props.getTransactionByOrg).toHaveBeenCalled();
    expect(props.getTransactionList).toHaveBeenCalled();
    expect(props.getTransactionPerHour).toHaveBeenCalled();
    expect(props.getTransactionPerMin).toHaveBeenCalled();
  }) */

	/*   test('component receives the same channel', () => {
    const { wrapper, props } = setup();
    wrapper.setProps({ channel: props.channel })
    expect(props.getBlockList).not.toHaveBeenCalled();
    expect(props.getBlocksPerHour).not.toHaveBeenCalled();
    expect(props.getBlocksPerMin).not.toHaveBeenCalled();
    expect(props.getChaincodeList).not.toHaveBeenCalled();
    expect(props.getDashStats).not.toHaveBeenCalled();
    expect(props.getPeerList).not.toHaveBeenCalled();
    expect(props.getPeerStatus).not.toHaveBeenCalled();
    expect(props.getTransactionByOrg).not.toHaveBeenCalled();
    expect(props.getTransactionList).not.toHaveBeenCalled();
    expect(props.getTransactionPerHour).not.toHaveBeenCalled();
    expect(props.getTransactionPerMin).not.toHaveBeenCalled();
  }) */
});
