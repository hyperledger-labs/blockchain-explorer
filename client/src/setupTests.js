/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
/* eslint-disable */
import { shallow, render, mount, configure } from 'enzyme';
/* eslint-enable */
import sinon from 'sinon';
// import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import localstorage from 'mock-local-storage';

configure({ adapter: new Adapter() });

global.matchMedia =
	global.matchMedia ||
	function() {
		return {
			matches: false,
			addListener() {},
			removeListener() {}
		};
	};

global.React = React;
global.shallow = shallow;
global.render = render;
global.mount = mount;
global.sinon = sinon;
global.localstorage = localstorage;
