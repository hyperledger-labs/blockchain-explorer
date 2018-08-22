var expect = require('chai').expect;
var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
var config = require('../platform/fabric/config.json');

describe('config.json should contain properties', function() {
  it('should contain configtxgenToolPath property', function() {
    var configtxgenToolPath = config.configtxgenToolPath;
    assert.notEqual(null, configtxgenToolPath);
  });

  it('should contain syncStartDate property', function() {
    var syncStartDate = config.syncStartDate;
    assert.notEqual(null, syncStartDate);
  });
});
