/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-expressions */

require('chai').should();
var path = require('path');

const { spawnSync } = require('child_process');
const dashboard = require('./dashboard/dashboard.js');
const network = require('./network/network_view.js');
const chaincode = require('./chaincode/chaincode_view.js');

describe('GUI e2e test', () => {
	before(async function() {
		this.timeout(180000);
		cwd = process.cwd();
		fabric_test_path = path.join(
			process.env.GOPATH,
			'/src/github.com/hyperledger/fabric-test',
			'/tools/operator'
		);
		network_spec_path = path.join(
			cwd,
			'e2e-test/specs/gui-e2e-test-network-spec.yml'
		);
		test_input_path = path.join(cwd, 'e2e-test/specs/smoke-test-input.yml');

		process.chdir(fabric_test_path);

		let child = spawnSync(
			'go',
			['run', 'main.go', '-i', network_spec_path, '-a', 'up'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('network up', child.stderr.toString());
		// else console.log('Network started', child.stdout.toString());

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

		process.chdir(cwd);
		child = spawnSync(
			'docker-compose',
			['-f', path.join(cwd, 'e2e-test/docker-compose-explorer.yaml'), 'up', '-d'],
			{ cwd: fabric_test_path, env: process.env, shell: true }
		);
		if (child.error) console.log('launch explorer', child.stderr.toString());
		else console.log('Launched explorer');

		// Wait for a while to get ready to start REST API server
		await new Promise(r => setTimeout(r, 20000));
	});

	describe('Run each test suite', () => {
		before(function() {
			// runs before all tests in this block
			browser.url('http://explorer.mynetwork.com:8080');
			// Login
			var userInput = browser.$('#user');
			var passInput = browser.$('#password');
			userInput.setValue('admin');
			passInput.setValue('adminpw');
			var signinBtn = browser.$('#root > div > div > div > form > button > span');

			signinBtn.click();
			browser.pause(1000);
		});

		describe('Check each view', () => {
			dashboard.test();
			network.test();
			chaincode.test();
		});
	});
});
