// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const networklist = require('./fixtures/networklist.json');

describe('GET /auth/networklist', () => {
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
	it('should return networklist ', done => {
		const obj = networklist;
		request.put('Accept', 'application/json');
		request.put('Content-Type', 'application/json');
		this.get.yields(null, JSON.stringify(obj));
		request.get(`${base}` + '/auth/networklist/', (err, body) => {
			body = JSON.parse(body);
			body.should.include.keys('status', 'networkList');
			body.status.should.eql(200);
			body.networkList.should.eql([['balance-transfer', {}]]);
			done();
		});
	});
});
