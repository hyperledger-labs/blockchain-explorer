
.. SPDX-License-Identifier: Apache-2.0


Getting Started with Hyperledger Explorer
=========================================

TODO


Hyperledger Explorer can run in your local environment or using docker. Minimum configuration allows you to get it setup up, and running
in short time.
There are well defined steps and `instructions <https://github.com/hyperledger/blockchain-explorer/blob/master/README.md>`__ how to get you setup and
run HL Explorer successfully. Along with the instructions you may find useful
`troubleshooting notes <https://github.com/hyperledger/blockchain-explorer/blob/master/TROUBLESHOOT.md>`__, that were collected, and or submitted
by community through the `mail listings <https://lists.hyperledger.org/g/explorer/topics>`__  or
`Rocket Chat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__ hyperledger-explorer channel.




Following are the software dependencies required to install and run hyperledger explorer:

	* `Node.js <https://nodejs.org/en/>`__ 8.11.x (Note that v9.x is not yet supported)
	* `PostgreSQL 9.5 or greater <https://www.postgresql.org/>`__
	* `jq <https://stedolan.github.io/jq>`__, a lightweight and flexible command-line JSON processor
	* Linux-based operating system, such as `Ubuntu <https://ubuntu.com/>`__ or MacOS

Verified Docker versions supported:

	* `Docker CE 18.09.2 or later <https://hub.docker.com/search/?type=edition&offering=community&operating_system=linux>`__
	* `Docker Compose 1.14.0 <https://docs.docker.com/compose>`__

.. note::

   See `Release Notes <https://github.com/hyperledger/blockchain-explorer/blob/master/README.md#10-release-notes---->`__ on supported Hyperledger Fabric and Explorer versions.


.. container:: content-tabs

    .. tab-container:: local
        :title: Run locally


        Assuming that your environment has the required software dependencies, follow up `instructions <https://github.com/hyperledger/blockchain-explorer/blob/master/README.md>`__  on how to setup Hyperledger Explorer to run in your local environment


    .. tab-container:: cloud
        :title: Run in cloud

        Content for Running HL Explorer in cloud

    .. tab-container:: docker
        :title: Run in docker

        Content for Running HL Explorer in docker

    .. tab-container:: kubernetes
        :title: Run in kubernetes

								Hyperledger Explorer project team did not test, or setup to run explorer in kubernetes, but someone did a tremendous job in setting it,
								and added an explanation on how to set it up.
								If you're interested to experiment, and willing to give a try you're more than welcomed.
								Please let us know if you succeeded in `running explorer in kubernetes <https://github.com/feitnomore/hyperledger-fabric-kubernetes>`__.








.. add a short overview, and rely on links in current README of the github


.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/


