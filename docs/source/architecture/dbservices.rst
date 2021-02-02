
.. SPDX-License-Identifier: Apache-2.0


Database Services
===========================================

This module is a set of API's that handle the interactions with the database. The layer is isolated from the HTTP request and response.
Hyperledger Explorer at this time persisting data from the Hyperledger Fabric only, no delete operations involved.

The following API's are part of the database services:
	1. `PersistenceFactory <https://github.com/hyperledger/blockchain-explorer/blob/main/app/persistence/PersistenceFactory.js>`__, responsible for platform based blockchain.
	2. `Persist <https://github.com/hyperledger/blockchain-explorer/blob/main/app/persistence/postgreSQL/Persist.js>`__, has a set of getters, and setters to get services such as CRUDService, MetricServices, and PgService.
	3. `PgService <https://github.com/hyperledger/blockchain-explorer/blob/main/app/persistence/postgreSQL/PgService.js>`__ is responsible to connect, and perform any data manipulation.
	4. `CRUDService <https://github.com/hyperledger/blockchain-explorer/blob/main/app/persistence/fabric/CRUDService.js>`__, has a set of platform specific, and interacts with models that are storing data related to Hyperledger Fabric network blockchain.
	5. `MetricService <https://github.com/hyperledger/blockchain-explorer/blob/main/app/persistence/fabric/MetricService.js>`__, is in charge of computing statistics of the blockchain activity, per hours, minutes, and organizations.

Below diagram shows above mentioned API's.

.. raw:: html
     :file: ./dbservices.html


