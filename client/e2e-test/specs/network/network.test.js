/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

const { chromium } = require('playwright');
require('chai').should();
const expect = require('chai').expect;

const helper = require('../utils/helper');

describe('Explorer network view', () => {
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
		await helper.switchView(page, 'NETWORK');
		await takeScreenShot(page, 'test2');
	});

	it('should have 3 peers and 2 orderer: BE-695', async () => {
		const nodes = await page.$$('text=/^PEER|ORDERER$/');
		const peerNameList = nodes.map(async (elm, idx, array) => {
			// Pick 2nd column of each row
			const firstCell = await elm.$('xpath=preceding-sibling::div');
			return firstCell.innerText();
		});

		await Promise.all(peerNameList).then(list => {
			expect(list).to.include.members([
				'peer0-org1:31000',
				'peer1-org1:31001',
				'peer0-org2:31002',
				'orderer0-ordererorg1:30000',
				'orderer1-ordererorg1:30001'
			]);
		});
	});

	after(async () => {
		await page.close();
		await contextCH.close();
		await browserCH.close();
	});
});
