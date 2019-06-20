/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import ChaincodeModal from './ChaincodeModal';

Enzyme.configure({ adapter: new Adapter() });
const ComponentNaked = unwrap(ChaincodeModal);

describe('<ChaincodeModal />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked chaincode={{}} classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});
	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<ChaincodeModal chaincode={{}} classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('mount with dark', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<ChaincodeModal chaincode={{}} classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});
