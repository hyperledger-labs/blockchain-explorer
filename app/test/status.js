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
const status = require('./fixtures/status.json');

describe('GET /api/status', () => {
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
  it('should return channel status', done => {
    const obj = status;
    this.get.yields(null, JSON.stringify(obj));
    request.get(`${base}` + '/api/status/' + config['channel'], (err, body) => {
      body = JSON.parse(body);
      body.should.include.keys(
        'chaincodeCount',
        'latestBlock',
        'peerCount',
        'txCount'
      );
      body.chaincodeCount.should.eql(1);
      body.latestBlock.should.eql(2);
      body.peerCount.should.eql(3);
      body.txCount.should.eql(5);
      done();
    });
  });
});
