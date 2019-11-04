
.. SPDX-License-Identifier: Apache-2.0


Configuration
===========================================

One of the requirements to receive blocks, transactions, and config properties from Hyperledger Fabric blockchain is to configure Hyperledger Explorer
to be able to connect to the default fabric network. For this we tried to have a minimal as possible configuration by taking advantage of the latest
Hyperledger Fabric `Service Discovery <https://hyperledger-fabric.readthedocs.io/en/release-1.4/discovery-overview.html>`__,
and `Gateway <https://hyperledger-fabric.readthedocs.io/en/release-1.4/developapps/gateway.html>`__.
As of now Hyperledger Explorer is able to connect only to a single Hyperledger Fabric network, and we believe that in the next releases we may be
able to have more than one network connected.

In previous versions we had a single file
`config.json <https://github.com/hyperledger/blockchain-explorer/blob/v0.3.8/app/platform/fabric/config.json>`__ file that was used to configure
Hyperledger Explorer, after the minimal configuration we divided in two parts, `config.json <https://github.com/hyperledger/blockchain-explorer/blob/master/app/platform/fabric/config.json>`__,
and `connection-profile <https://github.com/hyperledger/blockchain-explorer/blob/master/app/platform/fabric/connection-profile/first-network.json>`__, that described the network properties.

Sample Hyperledger Explorer configuration with one of the fabric sample network first-network, described below:

On another terminal:

.. code-block:: bash

   cd blockchain-explorer/app/platform/fabric

Modify config.json to point to your first-network network `connection-profile <https://github.com/hyperledger/blockchain-explorer/blob/master/app/platform/fabric/connection-profile/first-network.json>`__:

.. code-block:: json

			{
				"network-configs": {
					"first-network": {
						"name": "first-network",
						"profile": "./connection-profile/first-network.json"
					}
				},
				"license": "Apache-2.0"
			}

::

	"first-network" is the name of your connection profile, and can be changed to any name.

	"name" is a name you want to give to your fabric network, you can change only value of the key "name".

	"profile" is the location of your connection profile, you can change only value of the key "profile"

	Modify connection profile in the JSON file first-network.json:
	Change "fabric-path" to your fabric network disk path in the first-network.json file:
	/blockchain-explorer/app/platform/fabric/connection-profile/first-network.json
	Provide the full disk path to the adminPrivateKey config option, it usually ends with "_sk", for example:

	* "/fabric-path/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/aaacd899a6362a5c8cc1e6f86d13bfccc777375365bbda9c710bb7119993d71c_sk"

	* "adminUser" is the the admin user of the network, in this case it's fabric CA or an identity user.

	* "adminPassword" is the password for the admin user.

	* "enableAuthentication" is a flag to enable authentication using a login page, setting to false
	will skip authentication.








.. toctree::
   :maxdepth: 1


   dbconfig
   hlfabricconfig
   syncconfig
