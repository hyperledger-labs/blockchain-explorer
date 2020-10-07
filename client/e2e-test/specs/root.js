/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();
const path = require('path');

const { spawnSync, spawn } = require('child_process');
const dashboard = require('./dashboard/dashboard.js');
const network = require('./network/network_view.js');
const chaincode = require('./chaincode/chaincode_view.js');

describe('GUI e2e test', () => {
	let fabric_test_path;
	let rootdir;
	let network_spec_path;

	before(async function() {
		this.timeout(180000);
		const cwd = process.cwd();
		rootdir = path.join(cwd, '..');
		fabric_test_path = path.join(
			process.env.GOPATH,
			'/src/github.com/hyperledger/fabric-test',
			'/tools/operator'
		);
		const fabricVer = process.env.FABRIC_VERSION;
		let networkSpec = 'gui-e2e-test-network-spec.yml';
		if (fabricVer === '2') {
			networkSpec = 'gui-e2e-test-network-spec-v2.yml';
		}
		network_spec_path = path.join(cwd, 'e2e-test/specs', networkSpec);
		const test_input_path = path.join(cwd, 'e2e-test/specs/smoke-test-input.yml');

		process.chdir(fabric_test_path);

		let child = spawnSync(
			'go',
			['run', 'main.go', '-i', network_spec_path, '-a', 'up'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('network up', child.stderr.toString());
		else console.log('Network started');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'create'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('channel create', child.stderr.toString());
		else console.log('Created channel');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'join'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('channel join', child.stderr.toString());
		else console.log('Joined to channel');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'anchorpeer'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('update anchor', child.stderr.toString());
		else console.log('Updated anchor peer');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'install'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('cc install', child.stderr.toString());
		else console.log('Installed chaincode');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'instantiate'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('cc instantiate', child.stderr.toString());
		else console.log('Instantiated chaincode');

		child = spawnSync(
			'go',
			['run', 'main.go', '-i', test_input_path, '-a', 'invoke'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('cc invoke', child.stderr.toString());
		else console.log('Invoked chaincode');

		process.chdir(rootdir);
		child = spawnSync(
			'cp',
			[
				'-f',
				path.join(cwd, 'e2e-test/configs/config_guitest.json'),
				path.join(rootdir, 'app/platform/fabric/config.json')
			],
			{ cwd: rootdir, env: process.env, shell: true }
		);
		if (child.error) console.log('copy config.json', child.stderr.toString());

		child = spawnSync(
			'cp',
			[
				'-f',
				path.join(cwd, 'e2e-test/configs/connection-profile/*'),
				path.join(rootdir, 'app/platform/fabric/connection-profile/')
			],
			{ cwd: rootdir, env: process.env, shell: true }
		);
		if (child.error) {
			console.log('copy connection profiles', child.stderr.toString());
		}

		child = spawnSync(
			'sed',
			[
				'-i',
				'-e',
				`'s|GOPATH|${process.env.GOPATH}|'`,
				path.join(
					rootdir,
					'app/platform/fabric/connection-profile/org1-network-for-guitest.json'
				)
			],
			{ cwd: rootdir, env: process.env, shell: true }
		);
		if (child.error) {
			console.log('replace GOPATH with actual path', child.stderr.toString());
		} else {
			console.log('copy config.json');
		}

		process.env.LOG_LEVEL_CONSOLE = 'debug';
		process.env.EXPLORER_SYNC_BLOCKSYNCTIME_SEC = '5';
		child = spawn('npm', ['start'], {
			cwd: rootdir,
			env: process.env,
			shell: true
		});
		if (child.error) console.log('launch explorer', child.stderr.toString());
		else console.log('Launched explorer');

		// Wait for a while to get ready to start REST API server
		await new Promise(r => setTimeout(r, 20000));
	});

	describe('Run each test suite', () => {
		before(() => {
			// runs before all tests in this block
			browser.url('http://127.0.0.1:8080');
			// Login
			console.log('before all');
			const userInput = browser.$('#user');
			const passInput = browser.$('#password');
			try {
				userInput.setValue('admin');
				passInput.setValue('adminpw');
			} catch (error) {
				let child = spawnSync('docker', ['ps', '-a'], {
					cwd: fabric_test_path,
					env: process.env,
					shell: true
				});
				if (child.stdout) {
					console.log('docker ps (stdout)', child.stdout.toString());
				}
				if (child.stderr) {
					console.log('docker ps (stderr)', child.stderr.toString());
				}

				child = spawnSync('cat', [path.join(rootdir, 'logs/console/console.log')], {
					cwd: rootdir,
					env: process.env,
					shell: true
				});
				if (child.stdout) {
					console.log('docker logs (stdout)', child.stdout.toString());
				}
				if (child.stderr) {
					console.log('docker logs (stderr)', child.stderr.toString());
				}

				child = spawnSync(
					'find',
					// eslint-disable-next-line no-template-curly-in-string
					['${GOPATH}/src/github.com/hyperledger/fabric-test/tools/operator'],
					{
						cwd: fabric_test_path,
						env: process.env,
						shell: true
					}
				);
				if (child.stdout) {
					console.log('find crypto-config (stdout)', child.stdout.toString());
				}
				if (child.stderr) {
					console.log('find crypto-config (stderr)', child.stderr.toString());
				}
				return;
			}

			const signinBtn = browser.$(
				'#root > div > div > div > form > button > span'
			);

			signinBtn.click();
			browser.pause(1000);
		});

		describe('Check each view', () => {
			dashboard.test();
			network.test();
			chaincode.test();
		});

		after(() => {
			process.chdir(fabric_test_path);

			let child = spawnSync(
				'go',
				['run', 'main.go', '-i', network_spec_path, '-a', 'down'],
				{ cwd: fabric_test_path, env: process.env, shell: true }
			);
			if (child.error) console.log('network down', child.stderr.toString());
			else console.log('Network down');

			process.chdir(rootdir);

			child = spawnSync('npm', ['run', 'app-stop'], {
				cwd: rootdir,
				env: process.env,
				shell: true
			});
			if (child.error) console.log('stop explorer', child.stderr.toString());
			else console.log('stop explorer');
		});
	});
});
