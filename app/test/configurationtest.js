const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);
// var conf = require('../platform/fabric/Configuration.js');

describe('getDefaultOrg()', () => {
  /* it('should return String Org', function() {
    let org = conf.getDefaultOrg();
    assert.equal('string', typeof org);
  });
  it('should return same org', function() {
    let org1 = conf.getDefaultOrg();
    let org2 = conf.getDefaultOrg();
    assert.equal(org1, org2);
  }); */
});
describe('getDefaultPeer()', () => {
  /* it('should return String peer', function() {
    let peer = conf.getDefaultPeer();
    console.log(peer);
    assert.equal('string', typeof peer);
  });
  it('should return same peer', function() {
    let peer1 = conf.getDefaultPeer();
    let peer2 = conf.getDefaultPeer();
    assert.equal(peer1, peer2);
  }); */
});
describe('getOrgAdmin()', () => {
  /* it('should return admin obj', function() {
    let admin = conf.getOrgAdmin(conf.getDefaultOrg());
    assert.equal('object', typeof admin);
    assert.ok('key' in admin);
    assert.ok('cert' in admin);
  }); */
});
