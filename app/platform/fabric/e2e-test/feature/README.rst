Behave tests for Hyperledger Fabric Feature and System Tests
============================================================

.. image:: http://cdn.softwaretestinghelp.com/wp-content/qa/uploads/2007/08/regression-testing.jpg

Behave is a tool used for Behavior Driven Development (BDD) testing. It uses tests (feature files) written in a natural language called Gherkin. The tests are executed using python as the supporting code.

BDD is an agile software development technique that encourages collaboration between developers, QA and non-technical or business participants in a software project. Feel free to read more about `BDD`_.

.. _BDD: http://pythonhosted.org/behave/philosophy.html


This drectory contains a behave implementation of system and feature file testing for Hyperledger Fabric.

Full documentation and usage examples for Behave can be found in the `online documentation`_.

.. _online documentation: http://pythonhosted.org/behave/


Continuous Integration (CI) Execution
-------------------------------------
The following are links to the Jenkins execution of these tests:
 * `daily`_
 * `weekly`_
 * `release`_

.. _daily: https://jenkins.hyperledger.org/view/Daily
.. _weekly: https://jenkins.hyperledger.org/view/Weekly
.. _release: https://jenkins.hyperledger.org/view/Release


Pre-requisites
--------------
You must have the following installed:
    * `python`_ (You must have 2.7 due to package incompatibilities)
    * `docker`_
    * `docker-compose`_
    * `nodejs`_
    * `npm`_

Ensure that you have Docker for `Linux`_, `Mac`_ or `Windows`_ 1.12 or higher properly installed on your machine.

.. _python: https://www.python.org/
.. _docker: https://www.docker.com/
.. _docker-compose: https://docs.docker.com/compose/
.. _nodejs: https://nodejs.org/
.. _npm: https://www.npmjs.com/
.. _Linux: https://docs.docker.com/engine/installation/#supported-platforms
.. _Mac: https://docs.docker.com/engine/installation/mac/
.. _Windows: https://docs.docker.com/engine/installation/windows/

You can install Behave and additional packages, such as the `Govendor`_, using the ``./scripts/install_behave.sh`` (useful for linux distros that use the apt packaging manager). This script installs additional packages into your OS environment.

.. _Govendor: https://github.com/kardianos/govendor/

::

    $ cd /path/to/fabric-test/feature; ../scripts/install_behave.sh


The following repositories are dependencies and are included as submodules at the designated locations
    * `hyperledger-fabric`_: /path/to/fabric-test/fabric
    * `hyperledger-fabric-ca`_: /path/to/fabric-test/fabric-ca
    * `cello`_: /path/to/fabric-test/cello

.. _hyperledger-fabric: https://github.com/hyperledger/fabric
.. _hyperledger-fabric-ca: https://github.com/hyperledger/fabric-ca
.. _cello: https://github.com/hyperledger/cello

.. _Chaincode Vendoring:
The following commands must be executed
      `govendor init`
      `govendor add +external`

inside the chaincodes folder for any chaincode (GO language program) that imports packages, outside the shim or protos folder.

If the chaincode has imports from external third party, i.e. other than the packages in fabric outside the shim or protos, execute:
     `govendor fetch << fully qualified package name here >>`

Note: This vendoring can be done automatically for you, wherever your chaincode is located, by using some predefined feature steps. For exact syntax, search for "vendor" in the steps/basic_impl.py file, or search for "vendor" in an example testcase in the chaincodes.feature file.

Caveats and Gotchas
-------------------
* This framework uses the `signal`_ package, which currently only works well in NIX environments.
* When there is a need for executing commands that contain pipes (|) in a table, the user will need to use bang (!) instead. This is to make sure that the pipe in the command does not conflict with the pipe in the behave table.

.. _signal: https://docs.python.org/2/library/signal.html


================
Using VirtualEnv
================
It is also possible to execute these tests using `virtualenv`_. This allows for you to control your environment and ensure that the version of python and any other environment settings will be exactly what is needed regardless of the environment of the native machine.

.. _virtualenv: http://docs.python-guide.org/en/latest/dev/virtualenvs/

There are instructions for setting up a virtualenv for executing behave tests located at ``fabric-test/fabric/bddtests/README.md``.  Once these steps are completed and you have successfully setup the ``behave_venv`` virtual environment, execute the following before executing these behave tests.

::

    $ workon behave_venv


Getting Started
---------------
Before executing the behave tests, it is assumed that there are docker images and tools that have already been built.

================
Areas of Testing
================
BDD tests are testing functionality and feature behavior. With this in mind, the following are areas that we plan to be covered in these BDD tests:
   * Basic setup (Happy Path)
   * Orderer Functionality
      * solo
      * kafka
   * Ledgers
   * Endorser and committer peers
   * Fabric-CA (used for SSL connections)
   * Upgrades and Fallbacks
   * Bootstrapping
      * configtxgen
      * cryptogen
      * configtxlator
   * Growing and shrinking networks
   * Stopping and Starting components
   * … and more (such as different tooling, messages sizes, special scenarios)

The following are not covered in these BDD tests:
   * scalability
   * performance
   * long running tests
   * stress testing


======================
Building docker images
======================
When executing tests that are using docker-compose fabric-ca images, be sure to have the fabric-ca docker images built. You must perform a ``make docker`` in the ``/path/to/hyperledger/fabric-test/fabric-ca`` directory.

The docker images for ``peer``, ``orderer``, ``kafka``, and ``zookeeper`` are needed. You must perform a ``make docker`` in the ``/path/to/hyperledger/fabric-test/fabric`` directory.


=========================
Building tool executables
=========================
The **configtxgen**, **configtxlator** and **cryptogen** tools are used when bootstrapping the networks in these tests. As a result, you must perform a ``make configtxgen cryptogen configtxlator`` in the ``/path/to/hyperledger/fabric-test/fabric`` directory. Be sure that the executable location is added to your PATH.


How to Contribute
--------------------------

.. image:: http://i.imgur.com/ztYl4lG.jpg

There are different ways that you can contribute in this area.
 * Writing feature files
 * Writing python test code to execute the feature files
 * Adding docker-compose files for different network configurations

To add your contributions to the Hyperledger Fabric-test project, please refer to the `Hyperledger Fabric Contribution`_ page for more details.

.. _Hyperledger Fabric Contribution: http://hyperledger-fabric.readthedocs.io/en/latest/CONTRIBUTING.html

===================================
How Do I Write My Own Feature File?
===================================
The feature files are written by anyone who understands the requirements. This can be a business analyst, quality analyst, manager, developer, customer, etc. The file describes a feature or part of a feature with representative examples of expected outcomes and behaviors. These files are plain-text and do not require any compilation. Each feature step maps to a python step implementation. When choosing appropriate key phrases when writing feature files, look in the `Helpful Tools`_ section for more information.

The following is an example of a simple feature file:

.. sourcecode:: gherkin

    Feature: Test to ensure I take the correct accessory
      Scenario: Test what happens on a rainy day
        Given it is a new day
        When the day is rainy
        And the day is cold
        Then we should bring an umbrella
      Scenario Outline: Test what to bring
        Given it is a new day
        When the day is <weather>
        Then we should bring <accessory>
      Examples: Accessories
        | weather | accessory |
        |   hot   | swimsuit  |
        |  cold   |  coat     |
        |  cloudy |  nothing  |


Keywords that are used when writing feature files:
 * **Feature**
    * The introduction of the different feature test scenarios
    * You can have multiple scenarios for a single feature
 * **Scenario/Scenario Outline**
    * The title and description of the test
    * You can run the same test with multiple inputs
 * **Given**
    * Indicates a known state before any interaction with the system.
    * **Avoid talking about user interaction.**
 * **When**
    * Key actions are performed on the system.
    * This is the step which may or may not cause some state to change in your system.
 * **Then**
    * The observed and expected outcomes.
 * **And**
    * Can be used when layering any givens, whens, or thens.


========================
Writing python test code
========================
Feature steps used in the feature file scenarios are implemented in python files stored in the “steps” directory. As the python implementation code grows, fewer changes to the code base will be needed in order to add new tests. If you simply want to write feature files, you are free to do so using the existing predefined feature steps.

The behave implementation files are named '*<component>_impl.py*' and the utilities are named '*<action>_util.py*' in the steps directory.

Python implementation steps are identified using decorators which match the keyword from the feature file: 'given', 'when', 'then', and 'and'. The decorator accepts a string containing the rest of the phrase used in the scenario step it belongs to.


.. sourcecode:: python

    >>> from behave import *
    >>> @given('it is a new day')
    ... def step_impl(context):
    ...     # Do some work
    ...     pass
    >>> @when('the day is {weather}')
    ... def step_impl(context, weather):
    ...     weatherMap = {'rainy': 'an umbrella',
    ...                   'sunny': 'shades',
    ...                   'cold': 'a coat'}
    ...     context.accessory = weatherMap.get(weather, "nothing")
    >>> @then('we should bring {accessory}')
    ... def step_impl(context, accessory):
    ...     assert context.accessory == accessory, "You're taking the wrong accessory!"


====================
Docker-Compose Files
====================
These docker composition files are used when setting up and tearing down networks of different configurations. Different tests can use different docker compose files depending on the test scenario. We are currently using `version 2 docker compose`_ files.

.. _version 2 docker compose: https://docs.docker.com/compose/compose-file/compose-file-v2/


============================
How to execute Feature tests
============================
There are multiple ways to execute behave tests.
   * Execute all feature tests in the current directory
   * Execute all tests in a specific feature file
   * Execute all tests with a specified tag
   * Execute a specific test
   * Remote execution
   * Execute with logs

Local Execution
---------------
When executing the behave tests locally, there are some simple commands that may be useful.

**Executes all tests in directory**
::

    $ behave

**Executes specific feature file**
::

    $ behave mytestfile.feature

**Executes tests labelled with tag**
::

    $ behave -t mytag

**Executes tests labelled with tags not running the tests with skip label**
::

    $ behave --tags=mytag1 --tags=mytag2 --tags=-skip

**Executes a specific test**
::

    $ behave -n 'my scenario name'

**Executes a specific test saving logs of containers only when there are failures**
::

    $ behave -n 'my scenario name' -D logs=y

**Executes a specific test saving logs of containers**
::

    $ behave -n 'my scenario name' -D logs=force

**Executes a suite of tests on a remote network**
::

    $ behave -t remote -D network=<filename of the remote network config file>


Remote Execution
---------------
When executing the behave tests remotely, there is some setup that needs to take place. Namely, it is important to know the information for the network that you are testing on.

Also, note that any tests that are deemed well-suited for execution on a remote network are tagged with "remote".


Helpful Tools
-------------
Behave and the BDD ecosystem have a number of `tools`_ and extensions to assist in the development of tests. These tools include features that will display what feature steps are available for each keyword. Feel free to explore and use the tools, depending on your editor of choice.

.. _tools: http://behave.readthedocs.io/en/latest/behave_ecosystem.html


Helpful Docker Commands
-----------------------
There are many helpful Docker tutorials available online. Feel free to take a look at some helpful hints found in the `Hyperledger Fabric Docker Tips`_ page.

.. _Hyperledger Fabric Docker Tips: https://hyperledger-fabric.readthedocs.io/en/latest/chaincode4ade.html#download-docker-images

Some helpful docker commands when debugging:
   * View running containers
      * ``$ docker ps``
   * View all containers (active and non-active)
      * ``$ docker ps -a``
   * Stop all Docker containers
      * ``$ docker stop $(docker ps -a -q)``
   * Remove all containers.  Adding the `-f` will issue a "force" kill
      * ``$ docker rm -f $(docker ps -aq)``
   * Remove all images
      * ``$ docker rmi -f $(docker images -q)``
   * Remove all images except for hyperledger/fabric-baseimage
      * ``$ docker rmi $(docker images | grep -v 'hyperledger/fabric-baseimage:latest' | awk {'print $3'})``
   * Start a container
      * ``$ docker start <containerID>``
   * Stop a containerID
      * ``$ docker stop <containerID>``
   * View network settings for a specific container
      * ``$ docker inspect <containerID>``
   * View logs for a specific containerID
      * ``$ docker logs -f <containerID>``
   * View docker images installed locally
      * ``$ docker images``
   * View networks currently running
      * ``$ docker networks ls``
   * Remove a specific residual network
      * ``$ docker networks rm <network_name>``

.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/
