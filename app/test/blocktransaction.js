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
const blocktrans = require('./fixtures/blocktransaction.json');

describe('GET /api/block/transactions/:channel/:number', () => {
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
  it('should return currentchannel ', (done) => {
    const obj = blocktrans;
    this.get.yields(null, JSON.stringify(obj));
    request.get(
      `${`${base}` + '/api/block/transactions/'}${config.channel}/0`,
      (err, body) => {
        body = JSON.parse(body);
        body.should.include.keys('status', 'number', 'txCount');
        body.status.should.eql(200);
        body.number.should.eql(0);
        body.txCount.should.eql(1);

        done();
      }
    );
  });
});
