/*
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');

const { spawnSync, spawn } = require('child_process');

startNetwork = async () => {
	const cwd = process.cwd();
	const rootdir = path.join(cwd, '../..');

	const fabric_test_path = path.join(
		process.env.GOPATH,
		'/src/github.com/hyperledger/fabric-test',
		'/tools/operator'
	);
	const fabricVer = process.env.FABRIC_VERSION;
	let networkSpec = 'gui-e2e-test-network-spec.yml';
	if (fabricVer === '2') {
		networkSpec = 'gui-e2e-test-network-spec-v2.yml';
	}
	network_spec_path = path.join(cwd, './specs', networkSpec);
	const test_input_path = path.join(cwd, './specs/smoke-test-input.yml');

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
			path.join(cwd, './configs/config_guitest.json'),
			path.join(rootdir, 'app/platform/fabric/config.json')
		],
		{ cwd: rootdir, env: process.env, shell: true }
	);
	if (child.error) console.log('copy config.json', child.stderr.toString());

	child = spawnSync(
		'cp',
		[
			'-f',
			path.join(cwd, './configs/connection-profile/*'),
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
		shell: true,
		stdio: 'ignore',
		detached: true
	});
	if (child.error) console.log('launch explorer', child.stderr.toString());
	else {
		child.unref();
		console.log('Launched explorer');
	}

	// Wait for a while to get ready to start REST API server
	await new Promise(r => setTimeout(r, 40000));
};

startNetwork();
