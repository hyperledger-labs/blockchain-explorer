/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import AdminPanel from './AdminPanel';

const setup = () => {
	const wrapper = shallow(<AdminPanel />);

	return {
		wrapper
	};
};

describe('AdminPanel', () => {
	test('AdminPanel component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
});
