/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Enzyme, { shallow, mount } from 'enzyme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { Login } from './Login';

Enzyme.configure({ adapter: new Adapter() });

describe('<Login />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<Login classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<Login classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const wrapperone = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<Login classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapperone.exists()).toBe(true);
	});
});

const setup = () => {
	const props = {
		classes: {
			avatar: 'avatar',
			form: 'form',
			container: 'container',
			paper: 'paper',
			submit: 'submit'
		}
	};
	const wrapper = shallow(<Login {...props} />);

	return {
		wrapper,
		props
	};
};

describe('Login', () => {
	test('Login component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	test('Login state should pass values', () => {
		const { wrapper } = setup();
		wrapper.setState({
			user: 'admin',
			password: 'adminpw',
			network: 'first-network',
			networks: ['first-network', 'balance-transfer'],
			isLoading: 'true'
		});
		wrapper.update();
		expect(wrapper.exists()).toBe(true);
	});
});
