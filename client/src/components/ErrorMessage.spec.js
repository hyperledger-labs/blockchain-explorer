/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import ErrorMessage from './ErrorMessage';

const setup = () => {
	const props = {};
	const div = document.createElement('div');
	document.body.appendChild(div);
	const wrapper = mount(<ErrorMessage {...props} />, { attachTo: div });
	return {
		props,
		wrapper
	};
};

describe('ErrorMessage', () => {
	test('ErrorMessage component should render correctly', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
});
