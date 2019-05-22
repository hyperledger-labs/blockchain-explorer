// SPDX-License-Identifier: Apache-2.0
const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');

const should = chai.should();
const { spy, stub } = require('sinon');
const sinon = require('sinon');
const request = require('request');

const base = 'http://localhost:1337';
const transaction = require('./fixtures/transaction.json');

describe('GET /api/transaction/:channel_genesis_hash/:txid', () => {
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
	it('should return transaction ', done => {
		const obj = transaction;
		this.get.yields(null, JSON.stringify(obj));
		request.get(
			`${base}` +
				'/api/transaction/mychannel/6571ce3234a8808327849841eb9ed43a717f7f5bf430e1fb42f922f70185404d',
			(err, body) => {
				body = JSON.parse(body);
				body.should.include.keys('status', 'row');
				body.status.should.eql(200);
				body.row.should.include.keys(
					'id',
					'channelname',
					'txhash',
					'blockid',
					'chaincodename',
					'status',
					'createdt',
					'creator_msp_id',
					'endorser_msp_id',
					'type',
					'chaincode_id',
					'write_set',
					'read_set'
				);
				body.row.id.should.eql(10);
				body.row.status.should.eql(200);
				body.row.channelname.should.eql('mychannel');
				body.row.txhash.should.eql(
					'1752ce850935e0547e78b5396f64162a09c595f9ecc514f25afe48b52fa4d840'
				);
				body.row.blockid.should.eql(4);
				body.row.chaincodename.should.eql('mycc');
				body.row.status.should.eql(200);
				body.row.createdt.should.eql('2018-05-15T02:04:25.000Z');
				body.row.chaincode_id.should.eql('');
				body.row.creator_msp_id.should.eql('Org1MSP');
				body.row.endorser_msp_id.should.eql('{"Org1MSP"}');
				body.row.type.should.eql('ENDORSER_TRANSACTION');
				for (let i = 0; i < body.row.write_set.length; i++) {
					body.row.write_set[i].should.include.keys('chaincode', 'set');
				}
				for (let i = 0; i < body.row.read_set.length; i++) {
					body.row.read_set[i].should.include.keys('chaincode', 'set');
				}

				done();
			}
		);
	});
});
