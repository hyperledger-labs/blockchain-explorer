
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Test example for behave (BDD, Gherkin syntax)

```behave
Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

    Scenario Outline: <consensus_type> : Bring up explorer and send requests to the basic REST API functions successfully
        Given I have a bootstrapped fabric network of type <consensus_type>
        Given the NETWORK_PROFILE environment variable is solo-tls-disabled

        When an admin sets up a channel named "mychannel"
        When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on channel "mychannel"
        When a user invokes on the channel "mychannel" using chaincode named "mycc" with args ["invoke","a","b","10"]
        When I wait "3" seconds
        When a user queries on the channel "mychannel" using chaincode named "mycc" with args ["query","a"]
        Then a user receives a success response of 990

        When I start explorer
        Then the logs on explorer.mynetwork.com contains "Please open web browser to access ：" within 20 seconds

        # Need to wait enough until completing process a new BlockEvent
        Given I wait "20" seconds
        Given I set base URL to "http://localhost:8090"
        When I make a GET request to "auth/networklist"
        Then the response status code should equal 200
        Then the response structure should equal "networklistResp"
        Then JSON at path ".networkList" should equal [[ "first-network", {} ]]
```

# Setup


## Download tools & pull fabric images

```
$ curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.4 1.4.4 0.4.18 -s
```

## Prepare Explorer / Explorer-DB image

### Build images

```
$ cd /some/where/blockchain-explorer
$ ./build_docker_image.sh
```

### Pull images

```
$ docker pull hyperledger/explorer
$ docker pull hyperledger/explorer-db
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
$ cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test/feature
$ virtualenv e2e-test
$ source e2e-test/bin/activate
(e2e-test) $
```

### For macOS

```
$ pip install virtualenv
$ cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test/feature
$ virtualenv e2e-test
$ source e2e-test/bin/activate
(e2e-test) $
```

## Install required packages

```
# At /some/where/blockchain-explorer/app/platform/fabric/e2e-test/feature on virtual env
(e2e-test) $ pip install -r requirement.txt
```

# Run test scenarios

```
# At /some/where/blockchain-explorer/app/platform/fabric/e2e-test/feature on virtual env
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
  --- a/app/platform/fabric/e2e-test/feature/explorer.feature
  +++ b/app/platform/fabric/e2e-test/feature/explorer.feature
  @@ -145,7 +149,7 @@ Scenario: [balance-transfer] Register a new user and enroll successfully
      Then the response parameter "status" should equal 200

  @basic
  -# @doNotDecompose
  +@doNotDecompose
  Scenario: [first-network] Not supported to register a new user and enroll
      Given I start first-network
      Given the NETWORK_PROFILE environment variable is first-network
  ```

# How to upgrade fabric-test environment

All files copied from the original fabric-test repository have not been modified. When upgrading the baseline of fabric-test, you only need to override them.

```
$ git clone --recurse-submodules https://github.com/hyperledger/fabric-test.git -b release-1.4
$ cd fabric-test
$ git checkout --recurse-submodules 64a5e04  # Choose a certain commit hash to be used for this upgrade
$ find fabric/examples/chaincode fabric-samples/chaincode chaincodes/ feature/ -type f | zip fabric-test_64a5e04.zip -@
$ cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test
$ unzip -o /some/where/fabric-test_64a5e04.zip
```

## Added files for e2e-test environment

To add e2e-test support to explorer, we have added the following files over the original files from fabric-test repository.

```
app/platform/fabric/e2e-test/
  .gitignore
  README.md
  feature/
    explorer.feature
    explorer_gui_e2e.feature
    requirement.txt
    docker-compose/
      docker-compose-explorer.yaml
      docker-compose-kafka-sd.yml
    explorer-configs/
    steps/
      explorer_impl.py
      json_responses.py
```

# Project Structure

Feature files are intended to locate in `/app/platform/fabric/e2e-test/feature` folder. Corresponding steps are located in `/app/platform/fabric/e2e-test/feature/steps`.
Overall project structure is as follows:

```
app/platform/fabric/e2e-test/chaincodes/        // hyperledger/fabric-test
app/platform/fabric/e2e-test/fabric/            // hyperledger/fabric-test
app/platform/fabric/e2e-test/fabric-samples/    // hyperledger/fabric-test
app/platform/fabric/e2e-test/fabric-sdk-java/   // hyperledger/fabric-test
app/platform/fabric/e2e-test/feature/           // hyperledger/fabric-test

+-- requirement.txt    // store python requirements

+-- environment.py      // contains common actions related to scenarios (e.g. clearing headers after running each feature file)

+-- explorer.feature          // feature files (Test Scenarios)

+-- explorer_gui_e2e.feature  // feature files for GUI e2e test scenario

+-- configs/

    +-- {UUID}/         // crypto and channel artifacts dyanamically generated everytime running the scenarios

    +-- configtx.yaml   // contains common steps definitions

    +-- crypto.yaml     // contains common steps definitions

    +-- fabric-ca-server-config.yaml    // contains common steps definitions

+-- docker-compose/

    +-- docker-compose-*.yml            // definition of containers to support a variety of test network topology

    +-- docker-compose-explorer.yaml    // definition of containers to bring up Hyperledger Explorer / Explorer DB

    +-- docker-compose-kafka-sd.yml     // definition of containers to add configurations for service discovery to fabric network

+-- explorer-configs/                   // Configuration and Profile for each scenario
                                        // You can specify which environments should be in use on each scenario by defining NETWORK_PROFILE env variable

    +-- config-${NETWORK_PROFILE}.json  // Configuration of Explorer for each network

    +-- connection-profile/             // Profiles for each network

        +-- ${NETWORK_PROFILE}.json

    +-- chaincode/

+-- steps/

    +-- *_impl.py           // Existing steps for fabric-test repository environment to manipulating fabric network and asserting status

    +-- *_util.py           // Utility functions for fabric-test repository environment

    +-- explorer_impl.py    // New added steps for the e2e test of Hyperledger Explorer

    +-- json_responses.py   // response data structures described in Trafaret format

app/platform/fabric/e2e-test/README.md
```

Mainly we'll update `explorer.feature`, `steps/explorer_impl.py` and `steps/json_responses.py` to cover more scenarios.

# Link

* https://behave.readthedocs.io/en/latest/index.html
* https://github.com/hyperledger/fabric-test/tree/release-1.4/feature
  The Explorer e2e test environment is based on the fabric-test env
* https://github.com/stanfy/behave-rest
  This package is used to test REST API call in the BDD
