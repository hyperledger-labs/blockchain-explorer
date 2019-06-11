/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import Adapter from 'enzyme-adapter-react-16';
import Table from './Table';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(Table);

describe('<Table />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked classes={{}} />);
		expect(wrapper.exists()).toBe(true);
	});
});
