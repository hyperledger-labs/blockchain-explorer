// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const login = require('./fixtures/login.json');

describe('POST /auth/login', () => {
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

	it('should return login ', done => {
		const obj = login;
		this.post.yields(null, JSON.stringify(obj));
		request.post(
			`${base}` + '/auth/login/',
			{
				body: {
					user: 'admin',
					password: 'adminpw',
					network: 'first-network'
				}
			},
			(err, body) => {
				body = JSON.parse(body);
				body.should.include.keys('status', 'success', 'message', 'token', 'user');
				body.status.should.eql(200);
				body.success.should.eql('true');
				body.message.should.eql('You have successfully logged in!');
				body.token.should.eql(
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTU1MzI1MjQzNn0.MBIm7hFDAQ_jJaMNqX94V0I2uCsQxKqOZ5b0PoWMOnk'
				);
				body.user.message.should.eql('logged in');
				body.user.name.should.eql('admin');
			}
		);
		done();
	});
});
