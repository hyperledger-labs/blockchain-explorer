/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();
const expect = require('chai').expect;

function test() {
	describe('Dashboard view', () => {
		context('Statistics table', () => {
			it('should have a metrics', () => {
				browser.setTimeout({
					timeouts: 100000
				});

				// Num. of blocks
				let nodeNum = browser
					.$(
						'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > h1'
					)
					.getText();
				nodeNum.should.be.equal('6');

				// Num. of TX
				const txNum = browser
					.$(
						'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div:nth-child(2) > h1'
					)
					.getText();
				parseInt(txNum, 10).should.be.least(40);

				// Num. of Nodes
				nodeNum = browser
					.$(
						'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(3) > div > div:nth-child(2) > h1'
					)
					.getText();
				nodeNum.should.be.equal('3');

				// Num. of CC
				const ccNum = browser
					.$(
						'#root > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div:nth-child(2) > h1'
					)
					.getText();
				ccNum.should.be.equal('1');
			});
		});

		context('Peer list', () => {
			it('should have 4 peers and 3 orderers', () => {
				const peerList = browser.$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div.rt-table > div.rt-tbody'
				);
				const elmNum = peerList.getProperty('childElementCount');
				elmNum.should.be.equal(5);
			});

			it('should have the correct URL for each peer', () => {
				const peerUrlList = browser.$$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div.rt-table > div.rt-tbody > div > div > div'
				);
				const peerUrlStrList = peerUrlList.map((elm, idx, array) => {
					return elm.getText();
				});
				expect(peerUrlStrList).to.include('peer0-org1');
				expect(peerUrlStrList).to.include('peer1-org1');
				expect(peerUrlStrList).to.include('peer0-org2');
				expect(peerUrlStrList).to.include('orderer0-ordererorg1');
				expect(peerUrlStrList).to.include('orderer1-ordererorg1');
			});
		});

		describe('Block history', () => {
			it('should have 3 block entries', () => {
				const blkList = browser.$$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > div > div > section > div > div > div:nth-child(2) > div:nth-child(1)'
				);
				blkList[0].getText().should.be.equal('Block 5');
				blkList[1].getText().should.be.equal('Block 4');
				blkList[2].getText().should.be.equal('Block 3');
			});
		});

		describe('MSP pie chart', () => {
			it('should response to click', () => {
				let tooltip = browser.$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div.recharts-tooltip-wrapper.recharts-tooltip-wrapper-right.recharts-tooltip-wrapper-bottom > div > ul > li > span.recharts-tooltip-item-name'
				);
				let displayTooltip = tooltip.isExisting();
				expect(displayTooltip).to.be.false;

				const path = browser.$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > svg > g > g:nth-child(1)'
				);
				path.click();

				tooltip = browser.$(
					'#root > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div.recharts-tooltip-wrapper.recharts-tooltip-wrapper-right.recharts-tooltip-wrapper-bottom > div > ul > li > span.recharts-tooltip-item-name'
				);

				displayTooltip = tooltip.isExisting();
				expect(displayTooltip).to.be.true;
			});
		});
	});
}

module.exports = {
	test: test
};
