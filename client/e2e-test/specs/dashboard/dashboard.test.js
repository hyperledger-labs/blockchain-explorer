/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */
const { chromium } = require('playwright');
require('chai').should();
const expect = require('chai').expect;

const helper = require('../utils/helper');

describe('Dashboard view', () => {
	let page;
	let contextCH;
	let browserCH;

	before(async () => {
		browserCH = await chromium.launch({ headless: helper.isHeadless() });
		contextCH = await browserCH.newContext({
			viewport: {
				width: 1920,
				height: 1080
			},
			ignoreHTTPSErrors: true
		});
		page = await helper.setupPage(contextCH);
		await takeScreenShot(page, 'dashboard');
	});

	it('should have a metrics', async () => {
		// Num. of blocks
		const blkMetricsElm = await page.$('text=BLOCKS >> h1');
		const blkMetrics = await blkMetricsElm.innerText();
		expect(blkMetrics).to.be.equal('6');

		// Num. of TX
		const txMetricsElm = await page.$('text=TRANSACTIONS >> h1');
		const txMetrics = await txMetricsElm.innerText();
		expect(parseInt(txMetrics, 10)).to.be.least(40);

		// Num. of Nodes
		const nodeMetricsElm = await page.$('text=NODES >> h1');
		const nodeMetrics = await nodeMetricsElm.innerText();
		expect(nodeMetrics).to.be.equal('3');

		// Num. of CC
		const ccMetricsElm = await page.$('text=CHAINCODES >> h1');
		const ccMetrics = await ccMetricsElm.innerText();
		expect(ccMetrics).to.be.equal('1');
	});

	it('should have 3 peers and 2 orderers', async () => {
		// Node list
		const peerListElm = await page.$$('div.rt-tr-group >>  div[role=gridcell]');
		expect(peerListElm.length).to.be.equal(5);

		const peerUrlStrList = peerListElm.map(async (elm, idx, array) => {
			return await elm.innerText();
		});
		await Promise.all(peerUrlStrList).then(list => {
			expect(list).to.include.members([
				'peer0-org1:31000',
				'peer1-org1:31001',
				'peer0-org2:31002',
				'orderer0-ordererorg1:30000',
				'orderer1-ordererorg1:30001'
			]);
		});
	});

	it('should have 3 block entries', async () => {
		const blkListElm = await page.$$('text=/^Block \\d+/');
		const blkList = blkListElm.map(async (elm, idx, array) => {
			return await elm.innerText();
		});

		await Promise.all(blkList).then(list => {
			expect(list.length).to.be.equal(3);
		});
	});

	it('should response to click', async () => {
		const firstPathPieChart = await page.$('g.recharts-pie-sector > path');
		await firstPathPieChart.click();
		// await helper.takeScreenShot(page, 'tooltip');

		const PieChart = await page.$('text="Transactions by Organization"');
		const tooltip = await PieChart.$(
			'xpath=following-sibling::*//ul[contains(@class, "recharts-tooltip-item-list")]'
		);
		expect(tooltip).to.be.not.null;
	});

	after(async () => {
		await page.close();
		await contextCH.close();
		await browserCH.close();
	});
});
