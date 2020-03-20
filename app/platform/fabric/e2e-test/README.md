
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Ginkgo based end-to-end test for REST API

We need to test each REST API on actual fabric network automatically. To achieve this requirement efficiently, following to the same way with fabric-test repository is good option for us. 

Fabric-test provides a collection of utilities used to test the core Hyperledger Fabric projects. In Explorer, we use `Fabric Network Operator` and `Performance Traffic Engine (PTE)` to manipulate fabric network from our test suite written by golang (for API e2e-test) and node.js (for GUI e2e-test). The tool currently offers golang package and CLI.

# Prerequisites

* Go 1.11.0 or above
* The following packages:
  * github.com/onsi/ginkgo/ginkgo
  * github.com/onsi/gomega/...
  * gopkg.in/yaml.v2
* Fabric binaries downloaded in $PATH
* docker/docker-compose

# Setup

## Download fabric-test repository and sync up the sub modules

```
go get -d github.com/hyperledger/fabric-test
cd $GOPATH/src/github.com/hyperledger/fabric-test
git checkout release-1.4
git submodule update --init --recursive
git submodule foreach git checkout release-1.4

```

## Install the latest stable fabric-client node package into PTE tool directory

```
cd $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE
npm install fabric-client@1.4.8
npm install fabric-ca-client@1.4.8
```

## Create symboric link to PTE tool 

We need to keep some directory layouts to work together correctly each component of tools provided by fabric-test.

```
cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test
ln -s $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE ./PTE
```

# Running test suite 

```
cd /some/where/blockchain-explorer/app/platform/fabric/e2e-test
ginkgo -v
```

# Tips

* You can easily debug test code written by golang with using delve or VSCode debug functionality.

# Project Structure


```
runTestSuite.sh
  : Script to setup env and run test suite

configs/config_multi.json
configs/config_single.json
configs/connection-profile/org1-network.json
configs/connection-profile/org2-network.json
  : Configuration for Explorer used within the test suite

docker-compose.yaml
  : Docker compose file to bring up Explorer reside with fabric network managed by Operator tool

specs/apitest-network-spec.yml
  : Configuration of fabric network. Used when bring up fabric network

specs/apitest-input-multiprofile.yml
specs/apitest-input-singleprofile.yml
specs/apitest-input-singleprofile_addnewch.yml
  : Configuration for interacting to fabric network. Used when take actions like creating channel, joining to channel, etc.

specs/apitest_suite_test.go
specs/apitest_test.go
  : Test suite

specs/genchannelartifacts.sh
specs/runexplorer.sh
specs/stopexplorer.sh
  : Scritps executed via test suite

specs/templates/configtx.yaml
specs/templates/crypto-config.yaml
specs/templates/docker/docker-compose.yaml
  : Template file following to yaml.v2 package format. Used to generate artifacts for fabric network automatically
```

Mainly we'll update `specs/apitest_test.go` to cover more scenarios.

# Link

* https://github.com/hyperledger/fabric-test
  * https://github.com/hyperledger/fabric-test/tree/master/tools/operator
  * https://github.com/hyperledger/fabric-test/tree/master/tools/PTE
* http://onsi.github.io/ginkgo/
* http://onsi.github.io/gomega/