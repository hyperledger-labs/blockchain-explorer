/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Enzyme, { shallow, mount } from 'enzyme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { Register } from './Register';

Enzyme.configure({ adapter: new Adapter() });

describe('<Register />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<Register classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<Register classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});

const setup = () => {
	const props = {
		classes: {
			form: 'form',
			container: 'container',
			paper: 'paper',
			actions: 'actions'
		},
		userInfo: [
			{
				user: 'admin',
				password: 'adminpw',
				affiliation: 'test',
				roles: 'admin'
			}
		]
	};
	const wrapper = shallow(<Register {...props} />);

	return {
		wrapper,
		props
	};
};

describe('Register', () => {
	test('Register component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	test('Register state should pass values', () => {
		const { wrapper } = setup();
		wrapper.setState({
			user: 'admin',
			password: 'adminpw',
			affiliation: 'test',
			roles: 'admin',
			rolesList: ['admin', 'reader', 'writer'],
			isLoading: 'true'
		});
		wrapper.update();
		expect(wrapper.exists()).toBe(true);
	});
});
