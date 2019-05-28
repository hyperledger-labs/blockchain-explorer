/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { DashboardView } from './DashboardView';

Enzyme.configure({ adapter: new Adapter() });
const ComponentNaked = unwrap(DashboardView);

describe('<DashboardView />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked chaincode={{}} classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<DashboardView classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('mount with dark', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<DashboardView classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});

const setup = () => {
	const props = {
		classes: {
			background: 'background',
			view: 'view',
			blocks: 'blocks',
			count: 'count',
			statistic: 'statistic',
			vdivide: 'vdivide',
			avatar: 'avatar',
			node: 'node',
			block: 'block',
			chaincode: 'chaincode',
			transaction: 'transaction',
			section: 'section',
			center: 'center'
		},
		blockActivity: [
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			}
		],
		blockList: [
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			},
			{
				blockhash:
					'6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				blocknum: 20,
				channelname: 'mychannel',
				createdt: '2018-04-26T20:32:13.000Z',
				datahash:
					'2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
				id: 21,
				prehash: '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
				prev_blockhash: null,
				txcount: 2,
				txhash: [
					'308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
					'9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1'
				]
			}
		],
		channel: { currentChannel: 'mychannel' },
		dashStats: {
			chaincodeCount: '3',
			latestBlock: '12',
			peerCount: '4',
			txCount: '33'
		},
		peerStatus: [
			{
				server_hostname: 'peer0.org1.example.com',
				status: 'RUNNING'
			}
		],
		transactionByOrg: [
			{
				count: '3',
				creator_msp_id: 'OrdererMSP'
			}
		],
		getTxByOrg: jest.fn()
	};

	const wrapper = shallow(<DashboardView {...props} />);

	return {
		props,
		wrapper
	};
};

describe('DashboardView', () => {
	test('DashboardView component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	test('setNotifications', () => {
		const { wrapper, props } = setup();
		const { blockList } = props;
		wrapper.instance().setNotifications(blockList);
		expect(wrapper.state('notifications').length).toBe(3);
	});

	test('componentWillReceiveProps gets a notification', () => {
		const { wrapper } = setup();
		const previousState = wrapper.state('notifications').slice(0);
		wrapper.setProps({
			notification: {
				title: 'Block 12 Added',
				type: 'block',
				message: 'Block 12 established with 3 tx',
				time: '2018-05-30T21:15:09.000Z',
				txcount: 3,
				datahash: '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7'
			}
		});
		expect(wrapper.state('notifications')).not.toBe(previousState);
	});

	/*  test('componentWillReceiveProps gets a channel', () => {
    const { wrapper, props } = setup();
    const newChannel = { currentChannel: 'newChannel' };
    wrapper.setProps({ channel: newChannel, notification: {} })
   expect(props.getTxByOrg).toHaveBeenCalled();
  }) */
});
