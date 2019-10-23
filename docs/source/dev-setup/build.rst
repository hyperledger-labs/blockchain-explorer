--
--    SPDX-License-Identifier: Apache-2.0
--

Building Hyperledger Explorer
------------------------------

The following instructions assume that you have already set up your
:doc:`development environment <devenv>`.

To build Hyperledger Explorer:

::

    cd blockchain-explorer
    git checkout <branch-name>
    ./main.sh install

.. note::


			`Ask in chat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__  what is the branch name of the latest being in development


Running the unit tests
~~~~~~~~~~~~~~~~~~~~~~

Use the following sequence to run all unit tests

::

    cd blockchain-explorer
    ./main.sh install
    ./main.sh test



.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/
