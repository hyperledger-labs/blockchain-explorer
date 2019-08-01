/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import NotificationsPanel from './NotificationsPanel';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(NotificationsPanel);

describe('<NotificationsPanel />', () => {
	it('with shallow', () => {
		const notification = [
			{
				title: 'Block 12 Added',
				type: 'block',
				message: 'Block 12 established with 3 tx',
				time: '2018-05-30T21:15:09.000Z',
				txcount: 3,
				datahash: '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7'
			}
		];
		const wrapper = shallow(
			<ComponentNaked classes={{}} notifications={notification} />
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const notification = [
			{
				title: 'Block 12 Added',
				type: 'block',
				message: 'Block 12 established with 3 tx',
				time: '2018-05-30T21:15:09.000Z',
				txcount: 3,
				datahash: '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7'
			}
		];
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<NotificationsPanel classes={{}} notifications={notification} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const notification = [
			{
				title: 'Block 12 Added',
				type: 'block',
				message: 'Block 12 established with 3 tx',
				time: '2018-05-30T21:15:09.000Z',
				txcount: 3,
				datahash: '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7'
			}
		];
		const wrapperone = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<NotificationsPanel classes={{}} notifications={notification} />
			</MuiThemeProvider>
		);
		expect(wrapperone.exists()).toBe(true);
	});
});
