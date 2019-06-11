/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { App } from './App';
import Header from '../Header';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(App);

describe('<App />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});
});

jest.useFakeTimers();

const setup = () => {
	const wrapper = shallow(<App classes={{ app: 'app' }} />);

	return {
		wrapper
	};
};

describe('App', () => {
	test('App component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	test('if loading is false Header should render', () => {
		const { wrapper } = setup();
		wrapper.setProps({ auth: true });
		wrapper.setState({ loading: false });
		wrapper.update();
		expect(wrapper.find(Header).exists()).toBe(true);
	});

	test('if auth is falsey Header should not render', () => {
		const { wrapper } = setup();
		wrapper.setProps({ auth: false });
		wrapper.setState({ loading: false });
		wrapper.update();
		expect(wrapper.find(Header).exists()).toBe(false);
	});

	test('if auth is truthy Header should render', () => {
		const { wrapper } = setup();
		wrapper.setProps({ auth: true });
		wrapper.setState({ loading: false });
		wrapper.update();
		expect(wrapper.find(Header).exists()).toBe(true);
	});
});
