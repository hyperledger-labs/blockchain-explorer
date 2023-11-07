/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import client from 'prom-client';

export const metric_ledger_height = new client.Gauge({
	name: 'metric_ledger_height',
	help: 'metric_ledger_height_low: returns ledger height of the peer nodes',
	labelNames: ['channel', 'mspid', 'requests', 'server_hostname']
});

export const ledger_blockchain_height = new client.Gauge({
	name: 'ledger_blockchain_height',
	help: 'ledger_blockchain_height: returns block height of channel',
	labelNames: ['channel', 'channel_genesis_hash']
});

export const ledger_transaction_count = new client.Counter({
	name: 'ledger_transaction_count',
	help: 'metric_channel_txns: returns transaction count on a channel',
	labelNames: ['channel', 'channel_genesis_hash']
});

export const metric_node_up = new client.Gauge({
	name: 'metric_node_up',
	help: 'metric_node_up: returns status of peer and orderer node',
	labelNames: ['node', 'mspid']
});

export const ledger_blockstorage_commit_time = new client.Histogram({
	name: 'ledger_blockstorage_commit_time',
	help:
		'ledger_blockstorage_commit_time: Time taken in sec for committing block changes to state db.',
	labelNames: ['channel', 'channel_genesis_hash']
});

export const fabric_version = new client.Gauge({
	name: 'fabric_version',
	help: 'fabric_version: show fabric versions',
	labelNames: ['channel', 'channel_genesis_hash']
});
