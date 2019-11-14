
.. SPDX-License-Identifier: Apache-2.0


Database Layer
==============

Hyperledger Explorer uses `PostgreSQL <https://www.postgresql.org/>`__ database. The information about blocks,
transactions, channels etc will be stored in this database. This is a mature database
for real-time web applications as the updates will be retrieved from database instead of
the application polling data from the Hyperledger Fabric network.


The following diagram shows a high level view of the Hyperledger Explorer data model.

.. raw:: html
     :file: ./databaselayer.html


.. note::

   Please note, the connecting lines are just for info purposes to illustrate the relation, there are no constraints defined in the current database.

Physical schema
~~~~~~~~~~~~~~~~~~

The script `explorerpg.sql <https://github.com/hyperledger/blockchain-explorer/blob/master/app/persistence/fabric/postgreSQL/db/explorerpg.sql>`__ describes
Hyperledger Explorer database. Creation of the database is a mandatory step and it is done by running the script `createdb.sh <https://github.com/hyperledger/blockchain-explorer/blob/master/app/persistence/fabric/postgreSQL/db/createdb.sh>`__,
detailed steps and instructions are provided in the `README.md <https://github.com/hyperledger/blockchain-explorer/tree/master#Database-Setup>`__ file.





