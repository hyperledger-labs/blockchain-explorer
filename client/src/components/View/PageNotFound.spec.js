/**
 *    SPDX-License-Identifier: Apache-2.
 *
 **/

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import PageNotFound from './PageNotFound';

Enzyme.configure({ adapter: new Adapter() });
const ComponentNaked = unwrap(PageNotFound);

describe('<PageNotFound />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<PageNotFound classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<PageNotFound classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});
