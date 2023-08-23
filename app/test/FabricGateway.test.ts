/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { expect } from './expect';
import { FabricConfig } from '../platform/fabric/FabricConfig';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { FabricGateway } from '../platform/fabric/gateway/FabricGateway';

// DiscoveryService (this.ds)
const stubSend = sinon.stub();
const stubSign = sinon.stub();
const stubGetDiscoveryResults = sinon.stub();
const stubClose = sinon.stub();

// Discoverer
const stubConnect = sinon.stub();

// logger
const stubError = sinon.stub();
const stubWarn = sinon.stub();
const stubInfo = sinon.stub();

// Client
const stubSetTlsClientCertAndKey = sinon.stub();
const stubNewEndpoint = sinon.stub();

function getFabricGatewayInstance() {
	const { FabricGateway } = proxyquire
		.noCallThru()
		.load('../platform/fabric/gateway/FabricGateway', {
			'fabric-common': {
				DiscoveryService: function() {
					return {
						build: sinon.stub(),
						sign: stubSign,
						send: stubSend,
						getDiscoveryResults: stubGetDiscoveryResults,
						close: stubClose
					};
				},
				Client: function() {
					return {
						setTlsClientCertAndKey: stubSetTlsClientCertAndKey,
						newEndpoint: stubNewEndpoint
					};
				},
				Discoverer: function() {
					return {
						connect: stubConnect
					};
				}
			},
			'../../../common/helper': {
				helper: {
					getLogger: function() {
						return {
							error: stubError,
							warn: stubWarn,
							info: stubInfo
						};
					}
				}
			}
		});
	const config = new FabricConfig();
	config.initialize('first-network', {
		name: 'My first network',
		profile: './connection-profile/test-network.json'
	});
	sinon.stub(config, 'getPeerTlsCACertsPem');

	const gw = new FabricGateway(config);
	gw.clientTlsIdentity = {
		credentials: {
			certificate: 'abc',
			privateKey: 'def'
		},
		mspId: 'org1',
		type: 'X.509'
	};

	const stubGetNetwork = sinon.stub(gw.gateway, 'getNetwork');
	const stubGetChannel = sinon.stub();
	stubGetChannel.returns({});
	stubGetNetwork.returns(Promise.resolve({ getChannel: stubGetChannel }));

	return gw;
}

function resetAllStubs() {
	// DiscoveryService (this.ds)
  stubSend.reset();
	stubSign.reset();
	stubGetDiscoveryResults.reset();
	stubClose.reset();

	// Discoverer
	stubConnect.reset();

	// logger
	stubError.reset();
	stubInfo.reset();

	// Client
	stubSetTlsClientCertAndKey.reset();
	stubNewEndpoint.reset();
}

describe('setupDiscoveryRequest', () => {
	let gw: FabricGateway;

	before(() => {
		gw = getFabricGatewayInstance();
	});

	beforeEach(() => {
		resetAllStubs();
	});

	it('should return without error', async () => {
		await gw.setupDiscoveryRequest('testChannel');
		expect(stubSign.calledOnce).to.be.equal(true);
	});

	it('should throw error if fail to sign', async () => {
		stubSign.throws();
		await gw.setupDiscoveryRequest('testChannel');
		expect(stubError.calledOnce).to.be.equal(true);
	});
});

describe('getDiscoveryServiceTarget', () => {
	let gw: FabricGateway;

	before(() => {
		gw = getFabricGatewayInstance();
	});

	beforeEach(() => {
		resetAllStubs();
	});

	it('should return without error', async () => {
		const targetArray = await gw.getDiscoveryServiceTarget();
		expect(stubSetTlsClientCertAndKey.calledOnceWith('abc', 'def')).to.be.equal(
			true
		);
		expect(stubNewEndpoint.calledOnce).to.be.equal(true);
		expect(stubConnect.calledOnce).to.be.equal(true);
		expect(targetArray.length).to.be.equal(1);
	});

	it('should return without error when not assigned client TLS config', async () => {
		gw.clientTlsIdentity = undefined;
		const targetArray = await gw.getDiscoveryServiceTarget();
		expect(stubSetTlsClientCertAndKey.calledOnceWith()).to.be.equal(true);
		expect(stubNewEndpoint.calledOnce).to.be.equal(true);
		expect(stubConnect.calledOnce).to.be.equal(true);
		expect(targetArray.length).to.be.equal(1);
	});
});

describe('sendDiscoveryRequest', () => {
	let gw: FabricGateway;

	before(async () => {
		gw = getFabricGatewayInstance();
		await gw.setupDiscoveryRequest('testChannel');
	});

	beforeEach(() => {
		resetAllStubs();
	});

  it('should throw error when discoveryService.sends() throw error', async () => {
    stubSend.rejects(Promise.reject(new Error('REQUEST TIMEOUT')));
    await gw.sendDiscoveryRequest();
    expect(stubWarn.called).be.equal(true);
    expect(stubClose.calledOnce).be.equal(true);
  });

  it('should throw error when failed to call getDiscoveryResults()', async () => {
    stubGetDiscoveryResults.throws();
    await gw.sendDiscoveryRequest();
    expect(stubWarn.called).be.equal(true);
    expect(stubClose.calledOnce).be.equal(true);
  });

	it('should return without error', async () => {
		stubGetDiscoveryResults.returns(Promise.resolve());
		await gw.sendDiscoveryRequest();
		expect(stubError.called).be.equal(false);
	});
});

describe('getDiscoveryResult', () => {
	let gw: FabricGateway;
	let stubSetupDiscoveryRequest: sinon.SinonStub;

	before(async () => {
		gw = getFabricGatewayInstance();
		await gw.setupDiscoveryRequest('testChannel');
		stubSetupDiscoveryRequest = sinon.stub(gw, 'setupDiscoveryRequest');
	});

	beforeEach(() => {
		resetAllStubs();
		stubSetupDiscoveryRequest.reset();
	});

	it('should return without error', async () => {
		await gw.getDiscoveryResult('testChannel');
		expect(stubSetupDiscoveryRequest.calledOnce).be.equal(true);
	});

	it('should return without error if discover service has not been allocated yet', async () => {
		gw.ds = null;
		await gw.getDiscoveryResult('testChannel');
		expect(stubSetupDiscoveryRequest.calledOnce).be.equal(true);
	});
});
