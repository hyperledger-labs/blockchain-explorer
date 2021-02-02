
.. SPDX-License-Identifier: Apache-2.0


Synchronizer
===========================================

Incremental changes can have a big impact on application, and network performance, for this Hyperledger Explorer persists Hyperledger Fabric data
in order to be able to explore historical, latest blocks, and see metrics per channels.

Synchronization process can be run in two modes:
	1. Standalone sync, explorer UI unavailable.
	2. Local (Run with Explorer)

The image below represents the synchronization process.

.. raw:: html
     :file: ./synchronizer.html


How synchronization process works?
----------------------------------

Currently Hyperledger Explorer relies on `Service Discovery <https://hyperledger-fabric.readthedocs.io/en/latest/discovery-overview.html>`__ to discover the network topology, and to issue queries to get:
		* the MSPConfig of all organizations in the channel along with the orderer endpoints of the channel.
		* the peers that have joined the channel.
		* endorsement descriptor for given chaincode(s) in a channel.
		* the local membership information of the peer that responds to the query.

.. note::

   To enable Service Discovery the environment variables `CORE_PEER_GOSSIP_BOOTSTRAP <https://hyperledger-fabric.readthedocs.io/en/release-1.4/gossip.html>`__, and ``CORE_PEER_GOSSIP_EXTERNALENDPOINT`` needs to be added for each peer in the fabric network docker-compose.yaml file.


Once the sync process is started either in standalone, or local mode, Hyperledger Explorer will read the `config.json <https://github.com/hyperledger/blockchain-explorer/blob/main/app/platform/fabric/config.json>`__,
and will attempt to create a connection that was read from one of the connection profiles, for example `first-network.json <https://github.com/hyperledger/blockchain-explorer/blob/main/app/platform/fabric/connection-profile/first-network.json>`__.

The first step after establishing the connection, explorer will get the list of the channels, and then loop each channel to get the list of the peers,
organizations, chaincodes for a specific channel that will be passed to the `Hyperledger Fabric Client SDK <https://github.com/hyperledger/fabric-sdk-node>`__.

Each channel will be synchronized with explorer database, for the following:
		* existence of the channel
		* blocks per channel
		* transactions
		* chaincodes per channel
		* peers/orderers








.. toctree::
   :maxdepth: 1

   sync_configuration
