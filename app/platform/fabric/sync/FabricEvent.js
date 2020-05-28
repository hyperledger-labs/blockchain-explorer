/*
 * SPDX-License-Identifier: Apache-2.0
 */
const helper = require('../../../common/helper');

const logger = helper.getLogger('FabricEvent');

/**
 *
 *
 * @class FabricEvent
 */
class FabricEvent {
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

		for (const [channel_name, channel] of channels.entries()) {
			const eventHub = FabricEvent.channelEventHubs.get(channel_name);

			if (eventHub) {
				logger.debug(
					'initialize() - Channel event hub already exists for [%s]',
					channel_name
				);
				continue;
			}

			this.createChannelEventHub(channel);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel
	 * @memberof FabricEvent
	 */
	createChannelEventHub(channel) {
		// Create channel event hub
		const eventHub = channel.newChannelEventHub(this.client.defaultPeer);
		eventHub.registerBlockEvent(
			async block => {
				// Skip first block, it is process by peer event hub
				if (!(block.header.number === '0' || block.header.number === 0)) {
					await this.fabricServices.processBlockEvent(this.client, block);
				}
			},
			err => {
				logger.error('Block Event %s', err);
			}
		);
		this.connectChannelEventHub(channel.getName(), eventHub);
		// Set channel event hub to map
		FabricEvent.channelEventHubs.set(channel.getName(), eventHub);
		logger.debug(
			'Successfully created channel event hub for [%s]',
			channel.getName()
		);
	}
	/* eslint-disable */
	/**
	 *
	 *
	 * @param {*} channel_name
	 * @param {*} eventHub
	 * @returns
	 * @memberof FabricEvent
	 */
	connectChannelEventHub(channel_name, eventHub) {
		const _self = this;
		if (eventHub) {
			eventHub.connect(true);
			setTimeout(
				channel_name => {
					_self.synchChannelBlocks(channel_name);
				},
				5000,
				channel_name
			);
		} else {
			/* if channel event hub is not defined then create new channel event hub,
      this may happen when a new channel is created, and explorer is trying to get it
      */
			try {
				const channel = this.client.hfc_client.getChannel(channel_name);
				if (channel) {
					this.createChannelEventHub(channel);
				}
			} catch (err) {
				logger.error('Failed to get the channel ', err);
			}
			return false;
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
		const eventHub = FabricEvent.channelEventHubs.get(channel_name);
		if (eventHub) {
			return eventHub.isconnected();
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
	disconnectChannelEventHub(channel_name) {
		logger.debug('disconnectChannelEventHub(' + channel_name + ')');

		const eventHub = FabricEvent.channelEventHubs.get(channel_name);
		return eventHub.disconnect();
	}

	/**
	 *
	 *
	 * @memberof FabricEvent
	 */
	disconnectEventHubs() {
		logger.debug('disconnectEventHubs()');

		// disconnect all event hubs
		for (const [
			channel_name,
			eventHub
		] of FabricEvent.channelEventHubs.entries()) {
			const status = this.isChannelEventHubConnected(channel_name);
			if (status) {
				this.disconnectChannelEventHub(channel_name);
			} else {
				logger.debug(
					'disconnectEventHubs(), no connection found ',
					channel_name,
					eventHub
				);
			}
		}
	}

	// channel event hub used to sync the blocks
	/**
	 *
	 *
	 * @param {*} channel_name
	 * @memberof FabricEvent
	 */
	async synchChannelBlocks(channel_name) {
		if (this.isChannelEventHubConnected(channel_name)) {
			const channel = this.client.hfc_client.getChannel(channel_name);
			await this.fabricServices.synchBlocks(this.client, channel);
		}
	}

	/**
	 *
	 *
	 * @memberof FabricEvent
	 */
	async synchBlocks() {
		// getting all channels list from client ledger
		const channels = await this.client.fabricGateway.queryChannels();

		for (const channel of channels.channels) {
			const channel_name = channel.channel_id;
			if (!this.client.getChannels().get(channel_name)) {
				// initialize channel, if it is not exists in the client context
				await this.client.initializeNewChannel(channel_name);
				await this.fabricServices.synchNetworkConfigToDB(this.client);
			}
		}
		for (const channel of channels.channels) {
			const channel_name = channel.channel_id;
			// check channel event is connected
			if (this.isChannelEventHubConnected(channel_name)) {
				// call sync blocks
				const channel = this.client.hfc_client.getChannel(channel_name);
				await this.fabricServices.synchBlocks(this.client, channel);
			} else {
				const eventHub = FabricEvent.channelEventHubs.get(channel_name);
				if (eventHub) {
					// connect channel event hub
					this.connectChannelEventHub(channel_name, eventHub);
				} else {
					const channel = this.client.getChannels().get(channel_name);
					if (channel) {
						// create channel event hub
						this.createChannelEventHub(channel);
					} else {
						// initialize channel, if it is not exists in the client context
						await this.client.initializeNewChannel(this, channel_name);
						await this.fabricServices.synchNetworkConfigToDB(this.client);
					}
				}
			}
		}
	}
}

// static class variable
FabricEvent.channelEventHubs = new Map();

module.exports = FabricEvent;
