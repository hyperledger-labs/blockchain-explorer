/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import BlockView from './BlockView';

const setup = () => {
	const wrapper = shallow(<BlockView />);
	return {
		wrapper
	};
};

describe('BlockView', () => {
	test('BlockView component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
});
