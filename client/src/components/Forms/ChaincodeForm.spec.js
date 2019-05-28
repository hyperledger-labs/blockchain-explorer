/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import ChaincodeForm from './ChaincodeForm';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(ChaincodeForm);

describe('<ChaincodeForm />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<ChaincodeForm classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const wrapperone = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<ChaincodeForm classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapperone.exists()).toBe(true);
	});
});
