/*
 * SPDX-License-Identifier: Apache-2.0
 */

require('chai').should();
var expect = require('chai').expect;

describe('Explorer dashboard', () => {
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

	describe('statistics', () => {
		it('shoud have a metrics', () => {
			browser.setTimeout({
				timeouts: 100000
			});

			// Num. of blocks
			var nodeNum = browser
				.$(
					'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > h1'
				)
				.getText();
			nodeNum.should.be.equal('5');

			// Num. of TX
			var txNum = browser
				.$(
					'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div:nth-child(2) > h1'
				)
				.getText();
			txNum.should.be.equal('5');

			// Num. of Nodes
			var nodeNum = browser
				.$(
					'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(3) > div > div:nth-child(2) > h1'
				)
				.getText();
			nodeNum.should.be.equal('4');

			// Num. of CC
			var ccNum = browser
				.$(
					'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div:nth-child(2) > h1'
				)
				.getText();
			ccNum.should.be.equal('1');
		});
	});

	describe('peers', () => {
		it('should have 4 peers', () => {
			var peerList = browser.$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div.rt-table > div.rt-tbody'
			);
			var elmNum = peerList.getProperty('childElementCount');
			elmNum.should.be.equal(4);
		});

		it('should have the correct URL for each peer', () => {
			var peerUrlList = browser.$$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div.rt-table > div.rt-tbody > div > div > div'
			);
			let peerUrlStrList = peerUrlList.map((elm, idx, array) => {
				return elm.getText();
			});
			expect(peerUrlStrList).to.include('peer0.org1.example.com');
			expect(peerUrlStrList).to.include('peer1.org1.example.com');
			expect(peerUrlStrList).to.include('peer0.org2.example.com');
			expect(peerUrlStrList).to.include('peer1.org2.example.com');
		});
	});

	describe('blocks', () => {
		it('should have 3 block entries', () => {
			var blkList = browser.$$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > div > div > section > div > div > div:nth-child(2) > div:nth-child(1)'
			);
			blkList[0].getText().should.be.equal('Block 4');
			blkList[1].getText().should.be.equal('Block 3');
			blkList[2].getText().should.be.equal('Block 2');
		});
	});

	describe('MSP pie chart', () => {
		it('should response to click', () => {
			var tooltip = browser.$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div.recharts-tooltip-wrapper.recharts-tooltip-wrapper-right.recharts-tooltip-wrapper-bottom > div > ul > li > span.recharts-tooltip-item-name'
			);
			var displayTooltip = tooltip.isExisting();
			expect(displayTooltip).to.be.false;

			var path = browser.$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > svg > g > g:nth-child(1)'
			);
			path.click();

			var tooltip = browser.$(
				'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div.recharts-tooltip-wrapper.recharts-tooltip-wrapper-right.recharts-tooltip-wrapper-bottom > div > ul > li > span.recharts-tooltip-item-name'
			);

			var displayTooltip = tooltip.isExisting();
			expect(displayTooltip).to.be.true;
			console.log(tooltip.getText());
		});
	});
});
