/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import DatePicker from './DatePicker';

const setup = () => {
	const wrapper = shallow(<DatePicker />);

	return {
		wrapper
	};
};

describe('DatePicker', () => {
	test('DatePicker component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
});
