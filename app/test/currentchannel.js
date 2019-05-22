// SPDX-License-Identifier: Apache-2.0
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
const currentchannel = require('./fixtures/currentchannel.json');

describe('GET /api/curChannel', () => {
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
	it('should return currentchannel ', done => {
		const obj = currentchannel;
		this.get.yields(null, JSON.stringify(obj));
		request.get(`${base}` + '/api/curChannel/', (err, body) => {
			body = JSON.parse(body);
			body.should.include.keys('currentChannel');
			body.currentChannel.should.eql('mychannel');
			done();
		});
	});
});
