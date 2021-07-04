/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { helper } from '../../../common/helper';

const logger = helper.getLogger('FabricEvent');

/**
 *
 *
 * @class FabricEvent
 */
export class FabricEvent {
	client: any;
	fabricServices: any;
	static channelEventHubs: any;

	/**
	 * Creates an instance of FabricEvent.
	 * @param {*} client
	 * @param {*} fabricServices
	 * @memberof FabricEvent
	 */
	constructor(client, fabricServices) {
		this.client = client;
		this.fabricServices = fabricServices;
	}

	/**
	 *
	 *
	 * @memberof FabricEvent
	 */
	async initialize() {
		// Creating channel event hub
		const channels = this.client.getChannels();
		for (const channel_name of channels) {
			const listener = FabricEvent.channelEventHubs.get(channel_name);

			if (listener) {
				logger.debug(
					'initialize() - Channel event hub already exists for [%s]',
					channel_name
				);
				continue;
			}

			await this.createChannelEventHub(channel_name);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @memberof FabricEvent
	 */
	async createChannelEventHub(channel_name) {
		// Create channel event hub
		try {
			const network = await this.client.fabricGateway.gateway.getNetwork(
				channel_name
			);
			const listener = await network.addBlockListener(
				async event => {
					// Skip first block, it is process by peer event hub
					if (!(event.blockNumber.low === 0 && event.blockNumber.high === 0)) {
						const noDiscovery = false;
						await this.fabricServices.processBlockEvent(
							this.client,
							event.blockData,
							noDiscovery
						);
					}
				},
				{
					// Keep startBlock undefined because expecting to start listening from the current block.
					type: 'full'
				}
			);

			FabricEvent.channelEventHubs.set(channel_name, listener);

			logger.info('Successfully created channel event hub for [%s]', channel_name);
		} catch (error) {
			logger.error(`Failed to add block listener for ${channel_name}`);
		}
	}

	/* eslint-disable */
	/**
	 *
	 *
	 * @param {*} channel_name
	 * @memberof FabricEvent
	 */
	async connectChannelEventHub(channel_name) {
		try {
			await this.createChannelEventHub(channel_name);
		} catch (err) {
			logger.error('Failed to get the channel ', err);
		}
	}
	/* eslint-disable */
	/**
	 *
	 *
	 * @param {*} channel_name
	 * @returns
	 * @memberof FabricEvent
	 */
	isChannelEventHubConnected(channel_name) {
		const listener = FabricEvent.channelEventHubs.get(channel_name);
		if (listener) {
			return true;
		}
		return false;
	}

	/**
	 *
	 *
	 * @param {*} channel_name
	 * @returns
	 * @memberof FabricEvent
	 */
	async disconnectChannelEventHub(channel_name) {
		logger.debug('disconnectChannelEventHub(' + channel_name + ')');
		const listener = FabricEvent.channelEventHubs.get(channel_name);
		const network = await this.client.fabricGateway.gateway.getNetwork(
			channel_name
		);
		network.removeBlockListener(listener);
		FabricEvent.channelEventHubs.delete(channel_name);
		return;
	}

	/**
	 *
	 *
	 * @memberof FabricEvent
	 */
	disconnectEventHubs() {
		logger.debug('disconnectEventHubs()');

		// disconnect all event hubs
		for (const listenerEntry of FabricEvent.channelEventHubs) {
			const channel_name = listenerEntry[0];
			const status = this.isChannelEventHubConnected(channel_name);
			if (status) {
				this.disconnectChannelEventHub(channel_name);
			} else {
				logger.debug('disconnectEventHubs(), no connection found ', channel_name);
			}
		}
	}
}

// static class variable
FabricEvent.channelEventHubs = new Map();
