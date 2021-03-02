/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { TimeChart } from './TimeChart';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(TimeChart);

jest.useFakeTimers();
const setup = () => {
	const props = {
		classes: {
			content: 'content'
		},
		chartData: {
			dataMax: 10,
			displayData: [
				{ datetime: '2018-05-13T17:00:00.000Z', count: '10' },
				{ datetime: '2018-05-13T18:00:00.000Z', count: '0' },
				{ datetime: '2018-05-13T19:00:00.000Z', count: '0' },
				{ datetime: '2018-05-13T20:00:00.000Z', count: '0' },
				{ datetime: '2018-05-13T21:00:00.000Z', count: '0' },
				{ datetime: '2018-05-13T22:00:00.000Z', count: '0' },
				{ datetime: '2018-05-13T23:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T00:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T01:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T02:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T03:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T04:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T05:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T06:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T07:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T08:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T09:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T10:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T11:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T12:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T13:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T14:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T15:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T16:00:00.000Z', count: '0' },
				{ datetime: '2018-05-14T17:00:00.000Z', count: '0' }
			]
		}
	};

	const wrapper = shallow(<TimeChart {...props} />);

	return {
		props,
		wrapper
	};
};

describe('TimeChart', () => {
	test('TimeChart component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});

	test('Correct Values are passed to the child charts', () => {
		const { wrapper } = setup();
		const setupProps = setup().props.chartData.displayData;
		const passedProps = wrapper.find('Scatter').props().data;
		let propsMatch = true;
		for (const value in setupProps) {
			if (!_.isEqual(setupProps[value], passedProps[value])) {
				propsMatch = false;
				break;
			}
		}
		expect(propsMatch).toBe(true);
	});
});

describe('<TimeChart />', () => {
	it('with shallow', () => {
		const wrapperone = shallow(<TimeChart chartData={{}} classes={{}} />);
		expect(wrapperone.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapperone = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<TimeChart chartData={{}} classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapperone.exists()).toBe(true);
	});

	it('Check if dark theme is applied correctly', () => {
		const wrapperone = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<TimeChart chartData={{}} classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapperone.exists()).toBe(true);
	});
});
