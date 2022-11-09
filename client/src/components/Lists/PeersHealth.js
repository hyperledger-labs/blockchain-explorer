/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { peerStatusType } from '../types';
import ReactFlow from 'reactflow';
import PeerNode from '../Nodes/PeerNode';
import OrdererNode from '../Nodes/OrdererNode';

const PEER_NODE_CRITERIA = 4;

const getPeerNodePosition = index => {
	const COORDINATE_BASE = 150;
	const multiple = Math.ceil(index / PEER_NODE_CRITERIA);
	const order = index % PEER_NODE_CRITERIA;

	const coordinate = COORDINATE_BASE * multiple;

	return getPositionByOrder(order, coordinate);
};

const getPositionByOrder = (order, coordinate) => {
	switch (order) {
		case 0:
			return { x: coordinate, y: -coordinate };
		case 1:
			return { x: coordinate, y: coordinate };
		case 2:
			return { x: -coordinate, y: coordinate };
		case 3:
			return { x: -coordinate, y: -coordinate };
		default:
			return { x: coordinate, y: coordinate };
	}
};

const PeersHealth = ({ peerStatus }) => {
	const peerData = peerStatus
		.map(peerStatus => {
			const { mspid, status, peer_type } = peerStatus;
			const orgName = mspid.split('MSP')[0];
			const port = peerStatus.server_hostname.split(':')[1];

			return { orgName, status, port, peer_type };
		})
		.sort((a, b) => {
			if (a.peer_type === 'ORDERER') return -1;
			if (b.peer_type === 'ORDERER') return 1;
			return 0;
		});

	const ordererNode = peerData[0]
		? {
				id: String(0),
				data: peerData[0],
				position: { x: 0, y: 0 },
				type: 'orderer'
		  }
		: null;

	const nodes = [
		ordererNode,
		...peerData.slice(1).map((datum, index) => {
			return {
				id: String(index + 1),
				data: datum,
				position: getPeerNodePosition(index + 1),
				type: 'peer'
			};
		})
	];

	const edges = nodes.slice(1).reduceRight((prev, cur, index, arr) => {
		const prevNode = arr[index - 1];
		if (!prevNode) return prev;

		return [
			...prev,
			{
				id: `${cur.id} - ${prevNode.id}`,
				source: cur.id,
				target: prevNode.id,
				type: 'step',
				markerEnd: { type: 'arrowclosed' }
			}
		];
	}, []);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			fitView
			fitViewOptions={{ padding: 0.5 }}
			proOptions={{ hideAttribution: true }}
			nodeTypes={{ peer: PeerNode, orderer: OrdererNode }}
			zoomOnDoubleClick={false}
			nodesDraggable={false}
			nodesConnectable={false}
			nodesFocusable={false}
			edgesFocusable={false}
			elementsSelectable={false}
		/>
	);
};

PeersHealth.propTypes = {
	peerStatus: peerStatusType.isRequired
};

export default PeersHealth;
