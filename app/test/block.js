// SPDX-License-Identifier: Apache-2.0

const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const block = require('./fixtures/block.json');

describe('GET /api/block/:channel_genesis_hash/:number', () => {
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

	it('should return block ', done => {
		const obj = block;
		this.get.yields(null, JSON.stringify(obj));
		request.get(
			`${base}` +
				'/api/block/6571ce3234a8808327849841eb9ed43a717f7f5bf430e1fb42f922f70185404d/1',
			(err, body) => {
				body = JSON.parse(body);
				body.should.include.keys(
					'status',
					'number',
					'previous_hash',
					'data_hash',
					'transactions'
				);
				body.status.should.eql(200);
				body.number.should.eql('0');
				body.previous_hash.should.eql('');
				body.data_hash.should.eql(
					'2aca6a13e625a3a409461c1a849a42956adefb79f72f555cff3df4586afe7760'
				);
				done();
			}
		);
	});
});
