var expect = require('chai').expect;
var assert = require('assert');
var chai = require('chai');
var should = chai.should();
const { spy, stub } = require('sinon');
var config = require('../../app/platform/fabric/config');
var appconfig = require('../../appconfig.json');
var host = process.env.HOST || appconfig.host;
var port = process.env.PORT || appconfig.port;
var sinon = require('sinon');
var request = require('request');
const base = 'http://localhost:1337';
const txbyorg = require('./fixtures/txbyorg.json');

describe('GET /api/txByOrg/:channe', () => {
  before(() => {
    this.get = sinon.stub(request, 'get');
    this.post = sinon.stub(request, 'post');
    this.put = sinon.stub(request, 'put');
    this.delete = sinon.stub(request, 'delete');
  });

  after(() => {
    request.get.restore();
    request.post.restore();
    request.put.restore();
    request.delete.restore();
  });
  it('should return blockandtx ', done => {
    const obj = txbyorg;
    this.get.yields(null, JSON.stringify(obj));
    request.get(
      `${base}` + '/api/txByMinute/' + config['channel'],
      (err, body) => {
        body = JSON.parse(body);
        body.should.include.keys('status', 'rows');
        body.status.should.eql(200);
        for (let i = 0; i < body.rows.length; i++) {
          body.rows[i].should.include.keys('creator_msp_id', 'count');
        }
        done();
      }
    );
  });
});
