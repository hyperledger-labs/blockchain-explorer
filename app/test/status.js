const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const config = require('../../app/platform/fabric/config');
const appconfig = require('../../appconfig.json');

const host = process.env.HOST || appconfig.host;
const port = process.env.PORT || appconfig.port;
const sinon = require('sinon');
const request = require('request');

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
  it('should return channel status', (done) => {
    const obj = status;
    this.get.yields(null, JSON.stringify(obj));
    request.get(
      `${`${base}` + '/api/status/'}${config.channel}`,
      (err, body) => {
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
      }
    );
  });
});
