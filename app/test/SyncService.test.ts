/*
 *SPDX-License-Identifier: Apache-2.0
 */

import { expect } from './expect';
import { FabricConfig } from '../platform/fabric/FabricConfig';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { SyncServices } from '../platform/fabric/sync/SyncService';
import * as stubBlock from './block.json';
import * as stubConfigBlock from './block_config.json';

import { ExplorerError } from '../common/ExplorerError';
import * as FabricConst from '../platform/fabric/utils/FabricConst';
const fabric_const = FabricConst.fabric.const;

// logger
const stubError = sinon.stub();
const stubInfo = sinon.stub();
const stubDebug = sinon.stub();

const VALID_GENESIS_HASH = '8A+HyzS4sqZynD06BfNW7T1Vtv2SOXAOUJQK4itulus=';
const VALID_NETWORK_ID = 'test-network-id';
const VALID_CHANNEL_NAME = 'testchannel';

const stubPlatform = {
	send: sinon.spy()
};
const spySaveTransaction = sinon.spy();
const stubGetChannelGenHash = sinon.stub();

function getSyncServicesInstance() {
	const { SyncServices } = proxyquire
		.noCallThru()
		.load('../platform/fabric/sync/SyncService', {
			'convert-hex': {
				bytesToHex: sinon.stub()
			},
			'../../../common/helper': {
				helper: {
					getLogger: function() {
						return {
							error: stubError,
							info: stubInfo,
							debug: stubDebug,
							warn: sinon.stub()
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
	const stubGetCrudService = sinon.stub();
	stubGetCrudService.returns({
		saveBlock: sinon.stub().resolves(true),
		saveTransaction: spySaveTransaction,
		getChannel: sinon.stub()
	});
	const stubGetMetricService = sinon.stub();
	stubGetMetricService.returns({
		findMissingBlockNumber: sinon
			.stub()
			.returns([{ missing_id: 1 }, { missing_id: 2 }])
	});
	const stubPersistence = {
		getCrudService: stubGetCrudService,
		getMetricService: stubGetMetricService
	};
	const sync = new SyncServices(stubPlatform, stubPersistence);

	return sync;
}

function resetAllStubs(sync) {
	// logger
	stubError.reset();
	stubInfo.reset();

	sync.blocksInProcess = [];
	stubGetChannelGenHash.reset();
	stubPlatform.send.resetHistory();
	spySaveTransaction.resetHistory();
}

function setupClient() {
	const stubGetNetworkID = sinon.stub();
	stubGetNetworkID.returns(VALID_NETWORK_ID);
	stubGetChannelGenHash.returns(VALID_GENESIS_HASH);
	const stubClient = {
		getNetworkId: stubGetNetworkID,
		getChannelGenHash: stubGetChannelGenHash,
		initializeNewChannel: sinon.stub().resolves(true),
		initializeChannelFromDiscover: sinon.stub(),
		fabricGateway: {
			fabricConfig: {
				getRWSetEncoding: sinon.stub()
			},
			queryChainInfo: sinon.stub().returns({ height: { low: 10 } }),
			queryBlock: sinon.fake((channel_name, missing_id) => {
				if (channel_name === VALID_CHANNEL_NAME) {
					return stubBlock;
				} else {
					return null;
				}
			})
		}
	};
	return stubClient;
}

describe('processBlockEvent', () => {
	let sync: SyncServices;

	before(() => {
		sync = getSyncServicesInstance();
	});

	beforeEach(() => {
		resetAllStubs(sync);
	});

	it('should return without error', async () => {
		const stubClient = setupClient();

		await expect(sync.processBlockEvent(stubClient, stubBlock)).eventually.to.be
			.true;
		sinon.assert.calledOnce(stubPlatform.send);
		sinon.assert.calledWith(
			stubPlatform.send,
			sinon.match({ notify_type: fabric_const.NOTITY_TYPE_BLOCK })
		);
		expect(sync.blocksInProcess.length).equals(0);
	});

	it('should throw an error if it has already been in proces', async () => {
		const stubClient = setupClient();
		sync.blocksInProcess = ['mychannel_9'];

		await expect(sync.processBlockEvent(stubClient, stubBlock))
			.to.eventually.be.rejectedWith('Block already in processing')
			.and.be.an.instanceOf(ExplorerError);
		sinon.assert.notCalled(stubPlatform.send);
		expect(sync.blocksInProcess.length).equals(1);
	});

	it('should raise new channel notification if genesis has not already been stored yet', async () => {
		const stubClient = setupClient();

		stubGetChannelGenHash.onFirstCall().returns(null);
		stubGetChannelGenHash.onSecondCall().returns(VALID_GENESIS_HASH);
		stubClient.getChannelGenHash = stubGetChannelGenHash;
		const spyInsertDiscoveredCH = sinon.spy(sync, 'insertDiscoveredChannel');

		const clock = sinon.useFakeTimers();
		await expect(sync.processBlockEvent(stubClient, stubBlock))
			.to.eventually.be.rejectedWith('mychannel has not been inserted yet')
			.and.be.an.instanceOf(ExplorerError);
		clock.tick(20000);

		sinon.assert.calledOnce(spyInsertDiscoveredCH);
		expect(sync.blocksInProcess.length).equals(0);
		clock.restore();
	});

	it('should raise update channel notification if config block is processed', async () => {
		const stubClient = setupClient();

		const spyUpdateDiscoveredCH = sinon.spy(sync, 'updateDiscoveredChannel');

		const clock = sinon.useFakeTimers();
		await expect(sync.processBlockEvent(stubClient, stubConfigBlock)).to
			.eventually.to.be.true;
		clock.tick(20000);

		sinon.assert.calledWith(
			spySaveTransaction,
			VALID_NETWORK_ID,
			sinon.match(obj => {
				return 'txhash' in obj && obj['txhash'] !== undefined;
			}, 'txhash undefined')
		);
		sinon.assert.calledOnce(spyUpdateDiscoveredCH);
		expect(sync.blocksInProcess.length).equals(0);
		sinon.assert.calledOnce(stubPlatform.send);
		sinon.assert.calledWith(
			stubPlatform.send,
			sinon.match({ notify_type: fabric_const.NOTITY_TYPE_BLOCK })
		);
		clock.restore();
	});

	it("should be done without any errors when config block doesn't have any payload in last updated data", async () => {
		const stubClient = setupClient();

		stubConfigBlock.data.data[0].payload.data.last_update.payload = null;
		await expect(sync.processBlockEvent(stubClient, stubConfigBlock)).to
			.eventually.to.be.true;
	});
});

describe('syncBlocks', () => {
	let sync: SyncServices;

	before(() => {
		sync = getSyncServicesInstance();
	});

	beforeEach(() => {
		resetAllStubs(sync);
	});

	it('should return without error', async () => {
		const stubClient = setupClient();
		const stubProcessBlockEvent = sinon.stub(sync, 'processBlockEvent');

		await sync.syncBlocks(stubClient, VALID_CHANNEL_NAME);
		expect(stubProcessBlockEvent.calledTwice).to.be.true;
		stubProcessBlockEvent.restore();
	});

	it('should return without error when processBlockEvent throws exception', async () => {
		const stubClient = setupClient();
		const stubProcessBlockEvent = sinon.stub(sync, 'processBlockEvent');
		stubProcessBlockEvent.onFirstCall().throws('Block already in processing');
		stubError.reset();

		await sync.syncBlocks(stubClient, VALID_CHANNEL_NAME);
		expect(stubProcessBlockEvent.calledTwice).to.be.true;
		expect(stubError.calledWith('Failed to process Block # 1')).to.be.true;
		expect(stubError.calledWith('Failed to process Block # 2')).to.be.false;
		stubProcessBlockEvent.restore();
	});
});
