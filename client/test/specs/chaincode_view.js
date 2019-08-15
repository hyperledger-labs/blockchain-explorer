/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();

describe('Explorer chaincode view', () => {
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

	describe('chaincode list', () => {
		it('should have an entry: BE-688', () => {
			// Num. of blocks
			var ccLink = browser.$(
				'#root > div > div:nth-child(1) > div:nth-child(2) > nav > div > ul > li:nth-child(5)'
			);
			ccLink.click();
			browser.pause(5000);

			var ccName = browser.$(
				'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(1)'
			);
			ccName.getText().should.be.equal('mycc');

			var ccTxCount = browser.$(
				'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(4)'
			);
			ccTxCount.getText().should.be.equal('5');

			var ccChName = browser.$(
				'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(2)'
			);
			ccChName.getText().should.be.equal('mychannel');
		});
	});
});
