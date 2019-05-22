// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');

const test = require('tape');
const readline = require('readline');
const ArrayList = require('arraylist');
const StringBuilder = require('string-builder');
const fs = require('fs');
const pgtestdb = require('pg-testdb');

const config = require('../explorerconfig.json');

const pgconfig = config.postgreSQL;

const options = {
	testdb: 'pgtestdb',
	messages: false,
	connection: {
		host: pgconfig.host,
		port: pgconfig.port,
		user: 'postgres',
		password: 'postgres'
	}
};
const list = new ArrayList();
list.add('DROP USER IF EXISTS testuser;');
describe('Test explorerpg.sql for DDL statements syntax verification', () => {
	it('should read the file explorerpg.sql for ddl statements ', function(readdone) {
		this.timeout(5000);
		let sb = new StringBuilder('');
		let isMergeline = false;
		const fs = require('fs');

		const readline = require('readline');

		const instream = fs.createReadStream(
			'../persistence/fabric/postgreSQL/db/explorerpg.sql'
		);

		const outstream = new (require('stream'))();

		const rl = readline.createInterface(instream, outstream);
		rl.on('line', line => {
			if (
				(line.toUpperCase().startsWith('CREATE') ||
					line.toUpperCase().startsWith('DROP') ||
					line.toUpperCase().startsWith('ALTER') ||
					line.toUpperCase().startsWith('GRANT')) &&
				line.endsWith(';')
			) {
				if (
					!(
						line.toUpperCase().startsWith('CREATE DATABASE') ||
						line.toUpperCase().startsWith('DROP DATABASE')
					)
				) {
					line = line.replace(/:user/i, 'testuser');
					line = line.replace(/:passwd/, "'password'");
					line = line.replace(/:dbname/, 'pgtestdb');
					list.add(line);
				}
			} else if (
				(line.toUpperCase().startsWith('CREATE') ||
					line.toUpperCase().startsWith('DROP') ||
					line.toUpperCase().startsWith('ALTER') ||
					line.toUpperCase().startsWith('GRANT')) &&
				!line.endsWith(';')
			) {
				sb.append(line);
				isMergeline = true;
			} else if (isMergeline && line.endsWith(';')) {
				line = line.replace(/:user/i, 'testuser');
				line = line.replace(/:passwd/, "'password'");
				line = line.replace(/:dbname/, 'pgtestdb');
				list.add(line);
				sb.append(line);
				list.add(sb.toString());
				sb = new StringBuilder('');
				isMergeline = false;
			} else if (isMergeline) {
				sb.append(line);
			}
		});
		rl.on('close', line => {});
		readdone();
	});
	it('should execute statements successfully in  explorerpg.sql file ', function(testdone) {
		this.timeout(7000);
		options.tests = [];
		const newList = new ArrayList();
		for (let i = 0; i < list.size(); i++) {
			if (!list.get(i).startsWith(');') && list.get(i).length > 6) {
				newList.add(list.get(i));
			}
		}
		test('Test Results', t => {
			for (let i = 0; i < newList.size(); i++) {
				options.tests[i] = client => {
					if (i == 0) {
						client.connect();
					}
					return client
						.query(newList.get(i))
						.then(() => {
							t.pass(newList.get(i));
						})
						.catch(err => {
							t.fail(newList.get(i));
						});
				};
			}
			pgtestdb(options, (err, res) => {
				t.comment('Test completed and Temporary database deleted');
				t.end();
				testdone();
			});
		});
	});
});
