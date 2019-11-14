

.. SPDX-License-Identifier: Apache-2.0


Logs
===========================================

Logging is an important part of supporting Hyperledger Explorer in the complete application life cycle. Logs are created to debug,
and provide information while troubleshooting, and detect problems, and any failure of the application.

Why do we log?

* Performance, we care about performance, and to measure it we count on logging.
* Debugging, we need a mechanism to see when, and where the error occurred, and under what conditions.
* Error tracking, when errors do occur, we need to know when they started, and how often they occurred.
* Analyzing, logs are valuable sources of information. We can analyze logs to discover usage patterns and make decisions.

	* There are two directories created by the application, one for standalone sync, and when running with explorer
					* ``$blockchain-explorer/logs/``.
					* ``$blockchain-explorer/logs/sync``.

	* Both have same subdirectories
					* ``app/``.
					* ``db/``.
					* ``console/``.


.. container:: content-tabs

    .. tab-container:: apps
        :title: Application logs

        Information, debug, error and other types of events, these logs are located in ``$blockchain-explorer/logs/app/`` directory.

							.. raw:: html
												:file: ./logs_app.html

    .. tab-container:: db
        :title: Database logs

        Useful information, debug, and errors are recorded during the CRUD operations, logs are located in ``$blockchain-explorer/logs/db`` directory.

							.. raw:: html
												:file: ./logs_db.html


    .. tab-container:: console
        :title: Console logs

        Different levels of messages to stdout and stderr, all the console logs are also redirected to a console.log files for the auditing purposes, location the the logs are in ``$blockchain-explorer/logs/console`` directory.

							.. raw:: html
												:file: ./logs_console.html













.. note::

   Logs are rotated every 7 days.










