/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { expect } from './expect';
import { FabricConfig } from '../platform/fabric/FabricConfig';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { SyncServices } from '../platform/fabric/sync/SyncService';
import * as stubBlock from './block.json';

// DiscoveryService (this.ds)
const stubSign = sinon.stub();
const stubGetDiscoveryResults = sinon.stub();
const stubClose = sinon.stub();

// Discoverer
const stubConnect = sinon.stub();

// logger
const stubError = sinon.stub();
const stubInfo = sinon.stub();
const stubDebug = sinon.stub();

const stubPlatform = sinon.stub();
// const stubPersistence = sinon.stub();
// const stubClient = sinon.stub();

// Client
const stubSetTlsClientCertAndKey = sinon.stub();
const stubNewEndpoint = sinon.stub();

function getSyncServicesInstance() {
	const { SyncServices } = proxyquire
		.noCallThru()
		.load('../platform/fabric/sync/SyncService', {
			// 'fabric-common': {
			// 	DiscoveryService: function() {
			// 		return {
			// 			build: sinon.stub(),
			// 			sign: stubSign,
			// 			send: sinon.stub(),
			// 			getDiscoveryResults: stubGetDiscoveryResults,
			// 			close: stubClose
			// 		};
			// 	},
			// 	Client: function() {
			// 		return {
			// 			setTlsClientCertAndKey: stubSetTlsClientCertAndKey,
			// 			newEndpoint: stubNewEndpoint
			// 		};
			// 	},
			// 	Discoverer: function() {
			// 		return {
			// 			connect: stubConnect
			// 		};
			// 	}
			// },
			'convert-hex': {
				bytesToHex: sinon.stub()
			},
			'../../../common/helper': {
				helper: {
					getLogger: function() {
						return {
							error: stubError,
							info: stubInfo,
							debug: stubDebug
						};
					}
				}
			}
		});
	const config = new FabricConfig();
	config.initialize('first-network', {
		name: 'My first network',
		profile: './connection-profile/first-network.json'
	});
	sinon.stub(config, 'getPeerTlsCACertsPem');
	const stubGetCrudService = sinon.stub();
	stubGetCrudService.returns({
		saveBlock: sinon.stub(),
		saveTransaction: sinon.stub()
	});
	const stubPersistence = {
		getCrudService: stubGetCrudService
	};
	const sync = new SyncServices(stubPlatform, stubPersistence);
	// gw.clientTlsIdentity = {
	// 	credentials: {
	// 		certificate: 'abc',
	// 		privateKey: 'def'
	// 	},
	// 	mspId: 'org1',
	// 	type: 'X.509'
	// };

	// const stubGetNetwork = sinon.stub(gw.gateway, 'getNetwork');
	// const stubGetChannel = sinon.stub();
	// stubGetChannel.returns({});
	// stubGetNetwork.returns(Promise.resolve({ getChannel: stubGetChannel }));

	return sync;
}

function resetAllStubs() {
	// DiscoveryService (this.ds)
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

describe('processBlockEvent', () => {
	let sync: SyncServices;

	before(() => {
		sync = getSyncServicesInstance();
	});

	beforeEach(() => {
		resetAllStubs();
	});

	it('should return without error', async () => {
		const stubGetNetworkID = sinon.stub();
		stubGetNetworkID.returns('test-network-id');
		const stubGetChannelGenHash = sinon.stub();
		stubGetChannelGenHash.returns('8A+HyzS4sqZynD06BfNW7T1Vtv2SOXAOUJQK4itulus=');
		const stubClient = {
			getNetworkId: stubGetNetworkID,
			getChannelGenHash: stubGetChannelGenHash,
			fabricGateway: {
				fabricConfig: {
					getRWSetEncoding: sinon.stub()
				}
			}
		};
		const targetArray = await sync.processBlockEvent(stubClient, stubBlock);
		// expect(stubSetTlsClientCertAndKey.calledOnceWith('abc', 'def')).to.be.equal(
		// 	true
		// );
		// expect(stubNewEndpoint.calledOnce).to.be.equal(true);
		// expect(stubConnect.calledOnce).to.be.equal(true);
		// expect(targetArray.length).to.be.equal(1);
	});

	// it('should return without error when not assigned client TLS config', async () => {
	// 	gw.clientTlsIdentity = undefined;
	// 	const targetArray = await gw.getDiscoveryServiceTarget();
	// 	expect(stubSetTlsClientCertAndKey.calledOnceWith()).to.be.equal(true);
	// 	expect(stubNewEndpoint.calledOnce).to.be.equal(true);
	// 	expect(stubConnect.calledOnce).to.be.equal(true);
	// 	expect(targetArray.length).to.be.equal(1);
	// });
});

// describe('sendDiscoveryRequest', () => {
// 	let gw: FabricGateway;

// 	before(async () => {
// 		gw = getSyncServicesInstance();
// 		await gw.setupDiscoveryRequest('testChannel');
// 	});

// 	beforeEach(() => {
// 		resetAllStubs();
// 	});

// 	it('should return without error', async () => {
// 		stubGetDiscoveryResults.returns(Promise.resolve());
// 		await gw.sendDiscoveryRequest();
// 		expect(stubError.called).be.equal(false);
// 	});

// 	it('should throw error when failed to call getDiscoveryResults()', async () => {
// 		stubGetDiscoveryResults.throws();
// 		await gw.sendDiscoveryRequest();
// 		expect(stubError.called).be.equal(true);
// 		expect(stubClose.calledOnce).be.equal(true);
// 	});
// });

// describe('getDiscoveryResult', () => {
// 	let gw: FabricGateway;
// 	let stubSetupDiscoveryRequest: sinon.SinonStub;

// 	before(async () => {
// 		gw = getSyncServicesInstance();
// 		await gw.setupDiscoveryRequest('testChannel');
// 		stubSetupDiscoveryRequest = sinon.stub(gw, 'setupDiscoveryRequest');
// 	});

// 	beforeEach(() => {
// 		resetAllStubs();
// 		stubSetupDiscoveryRequest.reset();
// 	});

// 	it('should return without error', async () => {
// 		await gw.getDiscoveryResult('testChannel');
// 		expect(stubSetupDiscoveryRequest.calledOnce).be.equal(false);
// 	});

// 	it('should return without error if discover service has not been allocated yet', async () => {
// 		gw.ds = null;
// 		await gw.getDiscoveryResult('testChannel');
// 		expect(stubSetupDiscoveryRequest.calledOnce).be.equal(true);
// 	});
// });
