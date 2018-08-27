var expect = require('chai').expect;
var assert = require('assert');
var chai = require('chai');
var should = chai.should();
const { spy, stub } = require('sinon');
var config = require('../explorerconfig.json');
var pgconfig = config.postgreSQL;
var pgtestdb = require('pg-testdb');
var test = require('tape');
var readline = require('readline');
var ArrayList = require('arraylist');
const StringBuilder = require('string-builder');
var fs = require('fs');
var options = {
  testdb: 'pgtestdb',
  messages: false,
  connection: {
    host: pgconfig.host,
    port: pgconfig.port,
    user: 'postgres',
    password: 'postgres'
  }
};
var list = new ArrayList();
list.add('DROP USER IF EXISTS testuser;');
describe('Test explorerpg.sql for DDL statements syntax verification', function() {
  it('should read the file explorerpg.sql for ddl statements ', function(readdone) {
    this.timeout(5000);
    var sb = new StringBuilder('');
    var isMergeline = false;
    var fs = require('fs'),
      readline = require('readline'),
      instream = fs.createReadStream(
        '../persistence/fabric/postgreSQL/db/explorerpg.sql'
      ),
      outstream = new (require('stream'))(),
      rl = readline.createInterface(instream, outstream);
    rl.on('line', function(line) {
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
    rl.on('close', function(line) {});
    readdone();
  });
  it('should execute statements successfully in  explorerpg.sql file ', function(testdone) {
    this.timeout(7000);
    options.tests = [];
    var newList = new ArrayList();
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
