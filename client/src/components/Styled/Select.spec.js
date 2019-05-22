/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Select from './Select';

const setup = () => {
	const wrapper = shallow(<Select />);

	return {
		wrapper
	};
};

describe('Select', () => {
	test('Select component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
});
