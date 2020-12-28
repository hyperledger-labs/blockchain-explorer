/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

const { chromium } = require('playwright');
require('chai').should();
const expect = require('chai').expect;

const helper = require('../utils/helper');

describe('Explorer chaincode view', () => {
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

		await helper.switchView(page, 'CHAINCODES');
		await takeScreenShot(page, 'chaincode');
	});

	it('should have an entry: BE-688', async () => {
		// Num. of blocks
		const cc = await page.$('text=/^samplecc$/');
		expect(cc).to.be.not.null;

		const ch = await cc.$('xpath=following-sibling::div');
		const chName = await ch.innerText();
		expect(chName).to.be.equal('testorgschannel0');

		const path = await ch.$('xpath=following-sibling::div');
		/* In fabric 2.x, client can't get cc path */
		// const pathStr = await path.innerText();
		// expect(pathStr).to.be.equal(
		// 	'github.com/hyperledger/fabric-test/chaincodes/samplecc/go'
		// );

		const block = await path.$('xpath=following-sibling::div');
		const blockNum = await block.innerText();
		expect(parseInt(blockNum, 10)).to.be.least(40);
	});

	after(async () => {
		await page.close();
		await contextCH.close();
		await browserCH.close();
	});
});
