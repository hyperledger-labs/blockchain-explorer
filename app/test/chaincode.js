// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const chaincode = require('./fixtures/chaincode.json');

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
			`${base}` +
				'/api/chaincode/6571ce3234a8808327849841eb9ed43a717f7f5bf430e1fb42f922f70185404d',
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
