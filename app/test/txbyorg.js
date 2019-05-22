// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const txbyorg = require('./fixtures/txbyorg.json');

describe('GET /api/txByOrg/:channel', () => {
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
	it('should return txbyorg ', done => {
		const obj = txbyorg;
		this.get.yields(null, JSON.stringify(obj));
		request.get(
			`${base}` +
				'/api/txByOrg/6571ce3234a8808327849841eb9ed43a717f7f5bf430e1fb42f922f70185404d',
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
