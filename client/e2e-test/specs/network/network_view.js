/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();
var expect = require('chai').expect;

function test() {
	describe('Explorer network view', () => {
		describe('Peer node list', () => {
			it('should have 4 peers and 3 orderer: BE-695', () => {
				// Validate each node name retrieved form the table
				var networkLink = browser.$(
					'#root > div > div:nth-child(1) > div:nth-child(2) > nav > div > ul > li:nth-child(2)'
				);
				networkLink.click();
				browser.pause(5000);
				var pageSizeSelector = browser.$('.-pageSizeOptions select');
				pageSizeSelector.selectByIndex(1);

				var nodeLists = browser.$$(
					'#root > div > div > div > div > div > div > div > div.rt-table > div.rt-tbody > div > div > div:nth-child(1)'
				);
				let nodeStrList = nodeLists.map((elm, idx, array) => {
					return elm.getText();
				});
				expect(nodeStrList).to.include('peer0-org1');
				expect(nodeStrList).to.include('peer1-org1');
				expect(nodeStrList).to.include('peer0-org2');
				expect(nodeStrList).to.include('peer1-org2');
				expect(nodeStrList).to.include('orderer0-ordererorg1');
				expect(nodeStrList).to.include('orderer1-ordererorg1');
				expect(nodeStrList).to.include('orderer2-ordererorg1');
			});
		});
	});
}

module.exports = {
	test: test
};
