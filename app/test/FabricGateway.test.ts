/*
 *SPDX-License-Identifier: Apache-2.0
 */

/* tslint:disable:no-unused-expression */
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { FabricConfig } from '../platform/fabric/FabricConfig';

use(chaiAsPromised);
use(sinonChai);

// export const expect = chai.expect
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { assert } from 'console';
// import { expect } from './expect'

describe('setupDiscoveryRequest', () => {
	it('should return without error', async () => {
		const stubSign = sinon.stub();
		const { FabricGateway } = proxyquire
			.noCallThru()
			.load('../platform/fabric/gateway/FabricGateway', {
				'fabric-common': {
					DiscoveryService: function() {
						return {
							build: sinon.stub(),
							sign: stubSign
						};
					}
				},
				'../../../common/helper': {
					helper: {
						getLogger: function() {}
					}
				}
			});

		const config = new FabricConfig();
		config.initialize('first-network', {
			name: 'My first network',
			profile: './connection-profile/first-network.json'
		});

		const gw = new FabricGateway(config);
		const stubGetNetwork = sinon.stub(gw.gateway, 'getNetwork');
		const stubGetChannel = sinon.stub();
		stubGetChannel.returns({});
		stubGetNetwork.returns(Promise.resolve({ getChannel: stubGetChannel }));
		await gw.setupDiscoveryRequest('testChannel');
		expect(stubSign.calledOnce).to.be.equal(true);
	});
});
