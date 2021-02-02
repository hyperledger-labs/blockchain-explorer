
.. SPDX-License-Identifier: Apache-2.0


Contributing to Hyperledger Explorer
====================================

We welcome contributions to the Hyperledger Explorer Project in many forms like bug reports, feature requests,  documentation updates, code.

Getting a Linux Foundation account
----------------------------------

In order to participate in the development of the Hyperledger Explorer
project, you will need a `Linux Foundation account <https://identity.linuxfoundation.org/>`__.

You will need to use your LF ID to access to all the Hyperledger community tools, including:

 * `Jira <https://jira.hyperledger.org/projects/BE/issues>`__.
 * `RocketChat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__.
 * `Mailing list <https://lists.hyperledger.org/g/explorer>`__.


Bug Reports and Feature Requests
--------------------------------

We track all bugs and feature requests on `Hyperledger Explorer Jira <https://jira.hyperledger.org/projects/BE/issues>`__.
Please send a detailed bug report with relevant logs and steps to reproduce the issue when you encounter an issue.
We always appreciate such bug reports as it reduces our effort and will help us fix the bug easily.
Please use the search functionality to ensure that the bug/feature request you are trying to file does not exist already.
If it exists, you can always add additional information to the JIRA issue in the comments sections and start watching for updates.
All the issue here will be added to our backlog and prioritized in the upcoming sprints.
You can contact the developers for any general problems or questions on `Hyperledger Explorer Chat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__.


Communications
--------------

We use `RocketChat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__ for communication
and Zoom meeting™ for screen sharing between developers. Our
development planning and prioritization is done in
`JIRA <https://jira.hyperledger.org/secure/RapidBoard.jspa?rapidView=155&view=planning>`__, and we take longer running
discussions/decisions to the `mailing
list <https://lists.hyperledger.org/g/explorer>`__.

Contribution guide
------------------

Prerequisites
~~~~~~~~~~~~~~~~~~~~~

Following are the software dependencies required to install and run Hyperledger Explorer:

- Nodejs 8.11.x (Note that v9.x is not yet supported)
- PostgreSQL 9.5 or greater
- `jq (command-line JSON processor) <https://stedolan.github.io/jq>`__
- Linux-based operating system, such as Ubuntu
- MacOS

Verified Docker versions supported:

- `Docker CE 18.09.2 or later <https://hub.docker.com/search/?type=edition&offering=community&operating_system=linux>`__
- `Docker Compose 1.14.0 <https://docs.docker.com/compose>`__


Working on fixing issues and working stories
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Review the `issues list <https://jira.hyperledger.org/projects/BE/issues>`__ and find something that interests you.
Start with something relatively straight forward and achievable, and that no one is already assigned. If no one is assigned, then assign the issue
to yourself. Please be considerate and rescind the assignment if you cannot finish in a reasonable time, or add a comment saying that you are
still actively working the issue if you need a little more time.

Submitting your fix
~~~~~~~~~~~~~~~~~~~

If you just submitted a JIRA for a bug you've discovered, and would like to
provide a fix, we would welcome that gladly! Please assign the JIRA issue to
yourself, then you can submit a change request (PR), please follow guidance provided by `CONTRIBUTING.md <https://github.com/hyperledger/blockchain-explorer/blob/main/CONTRIBUTING.md>`__.


Copyright Notices
~~~~~~~~~~~~~~~~~~~

There should be a single LICENSE file in the top-level directory that contains the full text of the Apache License `here <http://www.apache.org/licenses/LICENSE-2.0>`__.




.. note:: In the individual files, please use the following line:


          ::

														/*
														   SPDX-License-Identifier: Apache-2.0
														*/



Related Topics
--------------

.. toctree::
   :maxdepth: 1

   MAINTAINERS
   dev-setup/devenv
   dev-setup/build
   dev-setup/azure
   Style-guides/js-style





.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/
