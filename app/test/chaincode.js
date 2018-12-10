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
const chaincode = require('./fixtures/chaincode.json');
const chaincodeinstall = require('./fixtures/chaincodeinstall.json');

describe('GET /api/chaincode/:channel', () => {
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
  it('should return chaincode ', done => {
    const obj = chaincode;
    this.get.yields(null, JSON.stringify(obj));
    request.get(
      `${`${base}` + '/api/chaincode/'}${config.channel}`,
      (err, body) => {
        body = JSON.parse(body);
        body.should.include.keys('status', 'chaincode');
        body.status.should.eql(200);
        for (let i = 0; i < body.chaincode.length; i++) {
          body.chaincode[i].should.include.keys(
            'channelName',
            'version',
            'path',
            'chaincodename',
            'txCount'
          );
        }
        done();
      }
    );
  });
});

describe('GET /api/chaincode/install', () => {
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
  it('should install chaincode ', done => {
    const obj = chaincodeinstall;
    this.get.yields(null, JSON.stringify(obj));
    request.get(`${base}` + '/api/chaincode/install', (err, body) => {
      body = JSON.parse(body);
      body.should.include.keys('status', 'chaincode');
      body.status.should.eql(200);
      for (let i = 0; i < body.chaincode.length; i++) {
        body.chaincode[i].should.include.keys(
          'channelName',
          'chaincodename',
          'path',
          'version',
          'type',
          'peer'
        );
      }
      done();
    });
  });
});
