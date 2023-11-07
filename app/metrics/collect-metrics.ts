/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { Proxy } from '../platform/fabric/Proxy';
import { Platform } from '../platform/fabric/Platform';
import {
	metric_ledger_height,
	ledger_blockchain_height,
	ledger_transaction_count,
	metric_node_up
} from './metrics';

export async function collectMetrics(platform: Platform) {
	const proxy: Proxy = platform.getProxy();
	const networks = await proxy.networkList();
	for (const network of networks) {
		const network_id = network.id;
		// get all the channels info
		const channelList = await proxy.getChannelsInfo(network_id);
		for (const channelInfo of channelList) {
			const channel_genesis = channelInfo.channel_genesis_hash;
			ledger_blockchain_height
				.labels({
					channel: channelInfo.channelname,
					channel_genesis_hash: channelInfo.channel_genesis_hash
				})
				.set(channelInfo.blocks);
			ledger_transaction_count
				.labels({
					channel: channelInfo.channelname,
					channel_genesis_hash: channelInfo.channel_genesis_hash
				})
				.inc();

			// get the peer status and the ledger height
			const peerStatus = await proxy.getPeersStatus(network_id, channel_genesis);
			setLedgerHeight(peerStatus, channelInfo.channelname);
		}
	}
}

async function setLedgerHeight(peerStatus: any[], channel: string) {
	for (const peer of peerStatus) {
		if (peer.peer_type === 'PEER' && typeof peer.ledger_height_low === 'number') {
			metric_ledger_height
				.labels({
					mspid: peer.mspid,
					requests: peer.requests,
					server_hostname: peer.server_hostname,
					channel: channel
				})
				.set(peer.ledger_height_low);
		}
		let status = 0;
		if (peer.status === 'UP') {
			status = 1;
		}
		metric_node_up
			.labels({ node: peer.server_hostname, mspid: peer.mspid })
			.set(status);
	}
}
