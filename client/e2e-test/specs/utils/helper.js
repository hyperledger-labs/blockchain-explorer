/*
 * SPDX-License-Identifier: Apache-2.0
 */

const scDirName = '.';
const headless = true;

let scIndex = 1;
let scPrefix = '';

setupPage = async context => {
	const page = await context.newPage();
	if (process.env.E2E_TEST_URL) {
		await page.goto(process.env.E2E_TEST_URL);
	} else {
		await page.goto('http://localhost:8080');
	}
	await page.fill('#user', 'admin');
	await page.fill('#password', 'adminpw');
	await page.click('button[type=submit]');
	await sleep(2000);
	return new Promise(resolve => resolve(page));
};

takeScreenShot = async (page, name) => {
	await sleep(2000);
	let prefix = String(scIndex++).padStart(3, '0');
	prefix = `${prefix}_${scPrefix}`;
	prefix = `${scDirName}/${prefix}`;
	return page.screenshot({ path: `${prefix}_${name}.png`, fullPage: true });
};

sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

switchView = async (page, viewname) => {
	await sleep(1000);
	await page.click(`a >> text=${viewname}`);
	return sleep(1000);
};

isHeadless = () => headless;

module.exports = {
	setupPage,
	takeScreenShot,
	sleep,
	switchView,
	isHeadless
};
