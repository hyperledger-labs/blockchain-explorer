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
const peers = require('./fixtures/peers.json');

describe('GET /api/peer/channel', () => {
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
  it('should return peers ', (done) => {
    const obj = peers;
    this.get.yields(null, JSON.stringify(obj));
    request.get(
      `${`${base}` + '/api/peers/'}${config.channel}`,
      (err, body) => {
        body = JSON.parse(body);
        body.should.include.keys('status', 'peers');
        body.status.should.eql(200);
        for (let i = 0; i < body.peers.length; i++) {
          body.peers[i].should.include.keys('requests', 'server_hostname');
        }
        done();
      }
    );
  });
});
