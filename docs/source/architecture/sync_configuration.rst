
.. SPDX-License-Identifier: Apache-2.0

Configuration
=============

- Modify `explorerconfig.json <https://github.com/hyperledger/blockchain-explorer/blob/master/app/explorerconfig.json>`__ to update sync properties:

  - sync type (``local`` or ``host``), platform, blocksSyncTime(in min) details.

- Sync Process Configuration

  - Ensure same configuration in Explorer explorerconfig.json if sync process is running from different locations.

.. container:: content-tabs

    .. tab-container:: standalone
        :title: Host (Standalone)

							   .. code-block:: json

														{
															"sync": {
															"type": "host"
															}
														}


    .. tab-container:: local
        :title: Local (Run with Explorer)

							  .. code-block:: json

														{
															"sync": {
															"type": "local"
															}
														}




- Running Sync Process

.. container:: content-tabs

    .. tab-container:: run_standalone
        :title: Run host (Standalone)

							  * From new terminal (if Sync Process in Standalone).

										* ``cd blockchain-explorer/``
										* ``./syncstart.sh`` (it will have the sync node up).
										* ``./syncstop.sh`` (it will stop the sync node).


    .. tab-container:: run_local
        :title: Run local (Run with Explorer)

							  * From a new terminal:

											* cd blockchain-explorer/
											* ``./start.sh`` (it will have the backend up).
											* ``./start.sh debug`` (it will have the backend in debug mode).
											* ``./start.sh print`` (it will print help).
											* Launch the URL ``http(s)://<host>:<port>`` on a browser.
											* ``./stop.sh`` (it will stop the node server).



.. attention::

			* Please restart Explorer if any changes made to `explorerconfig.json <https://github.com/hyperledger/blockchain-explorer/blob/master/app/explorerconfig.json>`__.

			  * If the Hyperledger Explorer was used previously in your browser be sure to clear the cache before relaunching.
			  * If Hyperledger Fabric network is deployed on other machine, please toggle ``DISCOVERY_AS_LOCALHOST`` in ``start.sh / syncstart.sh to 'false'``.





