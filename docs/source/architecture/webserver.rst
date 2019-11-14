
.. SPDX-License-Identifier: Apache-2.0




Webserver
==========

`Node.js <https://nodejs.org/>`__ is the backend framework for implementing the server-side components, and `Express <https://expressjs.com/>`__, a Web framework for Node.js.
application. The main entry point of the Hyperledger Explorer is
the `Broadcaster <https://github.com/hyperledger/blockchain-explorer/blob/master/main.js>`__ class,
that will initialize the application, WebSockets, create an Express server, and other processes to start the application.

Broadcaster class diagram shown in the image below.

.. raw:: html
     :file: ./webserver.html


