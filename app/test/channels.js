// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const channels = require('./fixtures/channels.json');

describe('GET /api/channels/', () => {
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
	it('should return channels ', done => {
		const obj = channels;
		this.get.yields(null, JSON.stringify(obj));
		request.get(`${base}` + '/api/channels', (err, body) => {
			body = JSON.parse(body);
			body.should.include.keys('status', 'channels');
			body.status.should.eql(200);
			done();
		});
	});
});
