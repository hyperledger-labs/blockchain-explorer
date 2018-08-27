var expect = require('chai').expect;
var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
//var conf = require('../platform/fabric/Configuration.js');

describe('getDefaultOrg()', function() {
  /*it('should return String Org', function() {
    let org = conf.getDefaultOrg();
    assert.equal('string', typeof org);
  });
  it('should return same org', function() {
    let org1 = conf.getDefaultOrg();
    let org2 = conf.getDefaultOrg();
    assert.equal(org1, org2);
  });*/
});
describe('getDefaultPeer()', function() {
  /*it('should return String peer', function() {
    let peer = conf.getDefaultPeer();
    console.log(peer);
    assert.equal('string', typeof peer);
  });
  it('should return same peer', function() {
    let peer1 = conf.getDefaultPeer();
    let peer2 = conf.getDefaultPeer();
    assert.equal(peer1, peer2);
  });*/
});
describe('getOrgAdmin()', function() {
  /*it('should return admin obj', function() {
    let admin = conf.getOrgAdmin(conf.getDefaultOrg());
    assert.equal('object', typeof admin);
    assert.ok('key' in admin);
    assert.ok('cert' in admin);
  });*/
});
