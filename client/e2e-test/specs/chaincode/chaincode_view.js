/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();

function test() {
	describe('Explorer chaincode view', () => {
		context('Chaincode list', () => {
			it('should have an entry: BE-688', () => {
				// Num. of blocks
				const ccLink = browser.$(
					'#root > div > div:nth-child(1) > div:nth-child(2) > nav > div > ul > li:nth-child(5)'
				);
				ccLink.click();
				browser.pause(5000);

				const ccName = browser.$(
					'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(1)'
				);
				ccName.getText().should.be.equal('samplecc');

				const ccTxCount = browser.$(
					'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(4)'
				);
				parseInt(ccTxCount.getText(), 10).should.be.least(40);

				const ccChName = browser.$(
					'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(2)'
				);
				ccChName.getText().should.be.equal('testorgschannel0');
			});
		});
	});
}

module.exports = {
	test: test
};
