
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Test example for behave (BDD, Gherkin syntax)

```behave
Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

    Scenario: Bring up explorer with tls-disabled fabric network and retrieve channel list successfully
        Given I have a bootstrapped fabric network of type solo without tls
        When an admin sets up a channel named "mychannel"
        When I start explorer
        Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

        Given I wait "5" seconds
        Given I set base URL to "http://localhost:8090"
        When I make a POST request to "auth/login" with parameters
        |user  |password   |network        |
        |test  |test       |first-network  |
        Then the response status code should equal 200
        Then the response structure should equal "loginResp"
        Then JSON at path ".success" should equal true
        Then JSON at path ".user.message" should equal "logged in"
        Then JSON at path ".user.name" should equal "test"

        Given JSON at path ".success" should equal true
        Given I want to reuse "token" parameter
        Given I set Authorization header to "context.token"
        When I make a GET request to "api/channels"
        Then the response status code should equal 200
        Then the response structure should equal "channelsResp"
        Then JSON at path ".channels" should equal ["mychannel"]
```

# Setup


## Pull fabric images

```
$ cd /some/where/fabric-samples
$ ./scripts/bootstrap.sh
```

## Build Explorer / Explorer-DB image

```
$ cd /some/where/blockchain-explorer
$ ./build_docker_image.sh
```

## Install python & pip

### For Linux (Ubuntu)

```
$ apt-get install python python-pip
```

### For macOS

 macOS comes with Python so there's a chance pip is already installed on your machine, verify the version
```
$ python --version
$ pip --version
```


## Setup virtualenv

### For Linux (Ubuntu)

```
$ apt-get install virtualenv
$ cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test
$ virtualenv e2e-test
$ source e2e-test/bin/activate
(e2e-test) $
```

### For macOS

```
$ pip install virtualenv
$ cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test
$ virtualenv e2e-test
$ source e2e-test/bin/activate
(e2e-test) $
```

## Install required packages

```
# At /some/where/blockchain-explorer/app/platform/fabric/e2e-test on virtual env
(e2e-test) $ pip install -r requirement.txt
```

# Run test scenarios

```
# At /some/where/blockchain-explorer/app/platform/fabric/e2e-test on virtual env
(e2e-test) $ behave ./explorer.feature
```

## Optional: Run test with npm

```
$ cd /some/where/blockchain-explorer
$ npm install      # To install npm-run-all package
$ npm run e2e-test
```

# Tips

* To enable stdout while running scenarios
  ```
  (e2e-test) $ behave --no-capture ./explorer.feature
  ```

* To execute only a certain scenario
  ```
  # Specify with line number
  (e2e-test) $ behave ./explorer.feature:111
  ```
  or
  ```
  # Specify with tag
  (e2e-test) $ behave --tags=@basic ./explorer.feature
  ```

* To preserve the test runtime environment without clean up when finishing test
  ```diff
  --- a/app/platform/fabric/e2e-test/explorer.feature
  +++ b/app/platform/fabric/e2e-test/explorer.feature
  @@ -145,7 +149,7 @@ Scenario: [balance-transfer] Register a new user and enroll successfully
      Then the response parameter "status" should equal 200

  @basic
  -# @doNotDecompose
  +@doNotDecompose
  Scenario: [first-network] Not supported to register a new user and enroll
      Given I start first-network
      Given the NETWORK_PROFILE environment variable is first-network
  ```

# Project Structure

Feature files are intended to locate in `/app/platform/fabric/e2e-test` folder. Corresponding steps are located in `/app/platform/fabric/e2e-test/steps`.
Overall project structure is as follows:

```
app/platform/fabric/e2e-test/

+-- requirements.txt    // store python requirements

+-- environment.py      // contains common actions related to scenarios (e.g. clearing headers after running each feature file)

+-- explorer.feature    // feature files (Test Scenarios)

+-- configs/

    +-- {UUID}/         // crypto and channel artifacts dyanamically generated everytime running the scenarios

    +-- configtx.yaml   // contains common steps definitions

    +-- crypto.yaml     // contains common steps definitions

    +-- fabric-ca-server-config.yaml    // contains common steps definitions

+-- docker-compose/

    +-- docker-compose-*.yml            // definition of containers to support a variety of test network topology

    +-- docker-compose-explorer.yaml    // definition of containers to bring up Hyperledger Explorer / Explorer DB

    +-- config.json                     // Configuration file for Hyperledger Explorer

+-- explorer-configs/                   // Configuration and Profile for each scenario
                                        // You can specify which environments should be in use on each scenario by defining NETWORK_PROFILE env variable

    +-- config-${NETWORK_PROFILE}.json  // Configuration of Explorer for each network

    +-- connection-profile/             // Profiles for each network

        +-- ${NETWORK_PROFILE}.json

+-- fabric-samples/         // Cloned from fabric-samples repo with tag:v1.4.0
                            // Some docker-compose files and scripts are modified a little bit for this BDD env

    +-- balance-transfer/

    +-- first-network/

    +-- chaincode/

+-- steps/

    +-- explorer_impl.py    // New added steps for the e2e test of Hyperledger Explorer

    +-- *_impl.py           // Existing steps for fabric-test repository environment to manipulating fabric network and asserting status

    +-- *_util.py           // Utility functions for fabric-test repository environment

    +-- json_responses.py   // response data structures described in Trafaret format

```

Mainly we'll update `explorer.feature`, `steps/explorer_impl.py` and `steps/json_responses.py` to cover more scenarios.

# Link

* https://behave.readthedocs.io/en/latest/index.html
* https://github.com/hyperledger/fabric-test/tree/release-1.4/feature
  The Explorer e2e test environment is based on the fabric-test env
* https://github.com/stanfy/behave-rest
  This package is used to test REST API call in the BDD
