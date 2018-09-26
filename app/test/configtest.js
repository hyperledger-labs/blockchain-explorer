const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);
const config = require('../platform/fabric/config.json');

describe('config.json should contain properties', () => {
  it('should contain configtxgenToolPath property', () => {
    const configtxgenToolPath = config.configtxgenToolPath;
    assert.notEqual(null, configtxgenToolPath);
  });
});
