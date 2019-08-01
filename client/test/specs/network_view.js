/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();
var expect = require('chai').expect;

describe('Explorer network view', () => {
	before(function() {
		// runs before all tests in this block
		browser.url('http://explorer.mynetwork.com:8080');
		// Login
		var userInput = browser.$('#user');
		var passInput = browser.$('#password');
		userInput.setValue('test');
		passInput.setValue('test');
		var signinBtn = browser.$('#root > div > div > div > form > button > span');

		signinBtn.click();
		browser.pause(1000);
	});

	describe('node list', () => {
		it('should have 4 peers and 1 orderer: BE-695', () => {
			// Validate each node name retrieved form the table
			var networkLink = browser.$(
				'#root > div > div:nth-child(1) > div:nth-child(2) > nav > div > ul > li:nth-child(2)'
			);
			networkLink.click();
			browser.pause(5000);

			var nodeLists = browser.$$(
				'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(1)'
			);
			let nodeStrList = nodeLists.map((elm, idx, array) => {
				return elm.getText();
			});
			expect(nodeStrList).to.include('peer0.org1.example.com');
			expect(nodeStrList).to.include('peer1.org1.example.com');
			expect(nodeStrList).to.include('peer0.org2.example.com');
			expect(nodeStrList).to.include('peer1.org2.example.com');
			expect(nodeStrList).to.include('orderer0.example.com');
		});
	});
});
