// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const changechannel = require('./fixtures/changechannel.json');

describe('GET /api/changeChannel/:channelName', () => {
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
	it('should return changedchannel ', done => {
		const obj = changechannel;
		this.get.yields(null, JSON.stringify(obj));
		request.get(`${base}` + '/api/changechannel/mychannel', (err, body) => {
			body = JSON.parse(body);
			body.should.include.keys('currentChannel');
			body.currentChannel.should.eql('mychannel');
			done();
		});
	});
});
