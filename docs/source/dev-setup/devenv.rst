--
--    SPDX-License-Identifier: Apache-2.0
--

Setting up the development environment
--------------------------------------

Overview
~~~~~~~~

Hyperledger Explorer has been developed in Ubuntu, and macOS environments

Please follow the instructions for Ubuntu builds, below.

Prerequisites
~~~~~~~~~~~~~

-  `Git client <https://git-scm.com/downloads>`__
-  `Go <https://golang.org/dl>`__ - version 1.11.x
-  (macOS)
   `Xcode <https://itunes.apple.com/us/app/xcode/id497799835?mt=12>`__
   must be installed
-  `Docker <https://www.docker.com/get-docker>`__ - 17.06.2-ce or later
-  `Docker Compose <https://docs.docker.com/compose>`__ - 1.14.0 or later
-  `Pip <https://pip.pypa.io/en/stable/installing>`__
-  (macOS) you may need to install gnutar, as macOS comes with bsdtar
   as the default, but the build uses some gnutar flags. You can use
   Homebrew to install it as follows:

::

    brew install gnu-tar --with-default-names

::

    pip install --upgrade pip


Steps
~~~~~

Set your GOPATH
^^^^^^^^^^^^^^^

Make sure you have properly setup your Host's `GOPATH environment
variable <https://github.com/golang/go/wiki/GOPATH>`__. This allows for
both building within the Host and the VM.

In case you installed Go into a different location from the standard one
your Go distribution assumes, make sure that you also set `GOROOT
environment variable <https://golang.org/doc/install#install>`__.

Cloning the Hyperledger Explorer source
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We are using ``Gerrit`` for source control, which has its
own internal git repositories. Hence, we will need to clone from
:doc:`Gerrit <../Gerrit/gerrit>`.
For brevity, the command is as follows:

::

    git clone ssh://<LFID>@gerrit.hyperledger.org:29418/blockchain-explorer && scp -p -P 29418 <LFID>@gerrit.hyperledger.org:hooks/commit-msg blockchain-explorer/.git/hooks/




**Note:** Of course, you would want to replace ``<LFID>`` with your own
:doc:`Linux Foundation ID <../Gerrit/lf-account>`.

Building Hyperledger Explorer
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once you have all the dependencies installed, and have cloned the
repository, you can proceed to :doc:`build and test <build>` Hyperledger
Explorer.


.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/
