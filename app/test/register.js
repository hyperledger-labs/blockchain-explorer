// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const register = require('./fixtures/register.json');

describe('POST /auth/register/', () => {
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

	it('should return register ', done => {
		const obj = register;
		this.post.yields(null, JSON.stringify(obj));
		request.post(
			`${base}` + '/auth/register',
			{
				body: {
					user: 'admin',
					password: 'adminpw',
					affiliation: 'testing',
					roles: 'admin'
				}
			},
			(err, body) => {
				body = JSON.parse(body);
				body.should.include.key('status');
				body.status.should.eql(200);
				done();
			}
		);
	});
});
