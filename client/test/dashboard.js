/*
 * SPDX-License-Identifier: Apache-2.0
 */

require('chai').should();

describe('Explorer dashboard', () => {
	it('shoud have a correct title', () => {
		browser.setTimeout({
			timeouts: 100000
		});
		browser.url('/');
		// Login
		var userInput = browser.$('#user');
		var passInput = browser.$('#password');
		userInput.setValue('test');
		passInput.setValue('test');
		var signinBtn = browser.$('#root > div > div > div > form > button > span');

		signinBtn.click();
		browser.pause(1000);

		// Dashboard
		var title = browser.getTitle();
		title.should.be.equal('Hyperledger Explorer');
		var nodeNum = browser
			.$(
				'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > h1'
			)
			.getText();
		nodeNum.should.be.equal('5');
	});
});
