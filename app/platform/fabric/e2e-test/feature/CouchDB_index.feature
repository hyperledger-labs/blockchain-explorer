#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

Feature: Testing Fabric CouchDB indexing

  @daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using marbles chaincode using <language> with 1 channels and 1 index with 1 selector
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "size" to the chaincode at path "<index_path>"

    # set up 1 channels, 1 cc
    When an admin sets up a channel named "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"

    # Invoke in the channel
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble100","red","5","cassey"] on "peer0.org1.example.com"

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles","{\\"selector\\":{\\"size\\":5}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"cassey"

    # Explicitly check with CouchDB to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"size":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num   |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    | FAB-7251    |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      | FAB-7254    |


@daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using marbles chaincode using <language> with 3 channels and 1 index with 3 selectors
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "owner,docType,color" to the chaincode at path "<index_path>"

    # set up 3 channels, each with one unique chaincode
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc2" with language "<language>" on channel "mychannel2"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc3" with language "<language>" on channel "mychannel3"

    # Invoke in each channel
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"matt\\", \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"alex\\", \\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"jose\\", \\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"

    # Explicitly check with CouchDB to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num   |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7252   |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7255   |


@daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using marbles chaincode using <language> with 3 channels and 3 index with 1 selector
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test_1 with design document name "indexdoc_behave_test_1" containing the fields "owner" to the chaincode at path "<index_path>"
    And a user defines a couchDB index named index_behave_test_2 with design document name "indexdoc_behave_test_2" containing the fields "docType" to the chaincode at path "<index_path>"
    And a user defines a couchDB index named index_behave_test_3 with design document name "indexdoc_behave_test_3" containing the fields "color" to the chaincode at path "<index_path>"

    # set up 3 channel, 1  cc
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc2" with language "<language>" on channel "mychannel2"
    And an admin deploys chaincode at path "<cc_path>" with args [""] with name "mycc3" with language "<language>" on channel "mychannel3"

    # Invoke in the channel
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"matt\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_1\\", \\"index_behave_test_1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"alex\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_1\\", \\"index_behave_test_1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"jose\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_1\\", \\"index_behave_test_1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_2\\", \\"index_behave_test_2\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_2\\", \\"index_behave_test_2\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_2\\", \\"index_behave_test_2\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_3\\", \\"index_behave_test_3\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_3\\", \\"index_behave_test_3\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_3\\", \\"index_behave_test_3\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"

    # Explicitly check with CouchDB to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container


Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num   |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7253   |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7256   |


  Scenario Outline: <jira_num>: Test CouchDB indexing using CC upgrade with marbles chaincode using <language> with 1 channel
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "owner,docType,color" to the chaincode at path "<index_path>"

    # set up 1 channel, 1 cc
    When an admin sets up a channel named "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"

    # Invoke in the channel
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"

    #add another index and deploy version 1
    When a user defines a couchDB index named index_behave_test_v1 with design document name "indexdoc_behave_test_v1" containing the fields "owner" to the chaincode at path "<index_path>"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "1" with args [""] with name "mycc1"
    And an admin upgrades the chaincode with name "mycc1" on channel "mychannel1" to version "1" with args [""]

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"matt\\", \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"matt\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"

    # Explicitly check with CouchDB to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_v1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num   |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7263   |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7268   |


  @daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using CC upgrade with marbles chaincode using <language> with 3 channels and 1 upgrade
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "owner,docType,color" to the chaincode at path "<index_path>"

    # set up 3 channels, 1  cc each
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc2" with language "<language>" on channel "mychannel2"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc3" with language "<language>" on channel "mychannel3"

    # Invoke in the channels
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    #add another index and deploy version 1 in 1 channel/cc only
    When a user defines a couchDB index named index_behave_test_v1 with design document name "indexdoc_behave_test_v1" containing the fields "owner" to the chaincode at path "<index_path>"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "1" with args [""] with name "mycc1"
    And an admin upgrades the chaincode with name "mycc1" on channel "mychannel1" to version "1" with args [""]

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"matt\\", \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"matt\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"alex\\", \\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"alex\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"jose\\", \\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"jose\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"

    # Check index in CouchDB for channel1 with upgraded CC
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_v1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

    #Check index in CouchDB for channel2 with non-upgraded CC
    And I wait "2" seconds
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    And I wait "2" seconds
    Then a user receives error response of [{"error":"not_found","reason":"missing"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

    #Check index in CouchDB for channel3 with non-upgraded CC
    And I wait "2" seconds
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    And I wait "2" seconds
    Then a user receives error response of [{"error":"not_found","reason":"missing"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num   |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7264   |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7269   |


@daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using CC upgrade with marbles chaincode using <language> with 3 channels and 3 upgrade
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "owner,docType,color" to the chaincode at path "<index_path>"

    # set up 3 channels, 1  cc each
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc1" with language "<language>" on channel "mychannel1"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc2" with language "<language>" on channel "mychannel2"
    And an admin deploys chaincode at path "<cc_path>" with version "0" with args [""] with name "mycc3" with language "<language>" on channel "mychannel3"

    # Invoke in the channels
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    #add another index and deploy version 1 in all 3 channel-cc
    When a user defines a couchDB index named index_behave_test_v1 with design document name "indexdoc_behave_test_v1" containing the fields "owner" to the chaincode at path "<index_path>"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "1" with args [""] with name "mycc1"
    And an admin upgrades the chaincode with name "mycc1" on channel "mychannel1" to version "1" with args [""]
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "1" with args [""] with name "mycc2"
    And an admin upgrades the chaincode with name "mycc2" on channel "mychannel2" to version "1" with args [""]
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "1" with args [""] with name "mycc3"
    And an admin upgrades the chaincode with name "mycc3" on channel "mychannel3" to version "1" with args [""]

    # Do sanity-check rich query
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"matt\\", \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"matt\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"matt"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"alex\\", \\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"alex\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"alex"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"jose\\", \\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"jose\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test_v1\\", \\"index_behave_test_v1\\"]}"] on "peer0.org1.example.com"
    Then a user receives a response containing "owner":"jose"

    # Check index in CouchDB for channel1 with upgraded CC
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_v1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

    # Check index in CouchDB for channel2 with upgraded CC
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_v1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

    # Check index in CouchDB for channel3 with upgraded CC
    When a user requests to get the design doc "indexdoc_behave_test_v1" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_v1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container


Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num                      |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7265, FAB-7266, FAB-7267  |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7270, FAB-7271, FAB-7272  |


@daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using install-after-instantiate with marbles chaincode using <language> with 3 channels and 1 index

    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test with design document name "indexdoc_behave_test" containing the fields "owner,docType,color" to the chaincode at path "<index_path>"

    # set up 3 channels, 1  cc each
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"

    # install the 3 ccs only in 3 (out of 4) peers and instantiate them
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel1" on peer "peer0.org1.example.com"

    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel2" on peer "peer0.org1.example.com"

    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel3" on peer "peer0.org1.example.com"
    And I wait "10" seconds

    # Invoke in the channels
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    # Now the late-install in 4th peer
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer1.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer1.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer1.org1.example.com"

    # Do sanity-check rich query in 4th peer
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"matt\\", \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"matt" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"alex\\", \\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"alex" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\",\\"owner\\":\\"jose\\", \\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"jose" from "peer1.org1.example.com"

    # Explicitly check with CouchDB in 4th peer to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:8984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:8984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:8984"
    Then a user receives success response of ["views":{"index_behave_test":{"map":{"fields":{"owner":"asc","docType":"asc","color":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num           |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7257, FAB-7258 |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7260, FAB-7261 |


@daily
  Scenario Outline: <jira_num>: Test CouchDB indexing using install-after-instantiate with marbles chaincode using <language> with 3 channels and 3 indexes

    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    When a user defines a couchDB index named index_behave_test_owner with design document name "indexdoc_behave_test" containing the fields "owner" to the chaincode at path "<index_path>"
    When a user defines a couchDB index named index_behave_test_docType with design document name "indexdoc_behave_test" containing the fields "docType" to the chaincode at path "<index_path>"
    When a user defines a couchDB index named index_behave_test_color with design document name "indexdoc_behave_test" containing the fields "color" to the chaincode at path "<index_path>"

    # set up 3 channels, 1  cc each
    When an admin sets up a channel named "mychannel1"
    And an admin sets up a channel named "mychannel2"
    And an admin sets up a channel named "mychannel3"

    # install the 3 ccs only in 3 (out of 4) peers and instantiate them
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel1" on peer "peer0.org1.example.com"

    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel2" on peer "peer0.org1.example.com"

    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer0.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer1.org2.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer0.org2.example.com"
    And an admin instantiates the chaincode on channel "mychannel3" on peer "peer0.org1.example.com"
    And I wait "10" seconds

    # Invoke in the channels
    When a user invokes on the channel "mychannel1" using chaincode named "mycc1" with args ["initMarble","marble1","green","10","matt"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel2" using chaincode named "mycc2" with args ["initMarble","marble2","yellow","20","alex"] on "peer0.org1.example.com"
    And a user invokes on the channel "mychannel3" using chaincode named "mycc3" with args ["initMarble","marble3","red","5","jose"] on "peer0.org1.example.com"

    # Now the late-install in 4th peer
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc1" to "peer1.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc2" to "peer1.org1.example.com"
    And an admin installs chaincode at path "<cc_path>" of language "<language>" as version "0" with args [""] with name "mycc3" to "peer1.org1.example.com"

    # Do sanity-check rich query in 4th peer
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"matt\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_owner\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"matt" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"alex\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_owner\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"alex" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"owner\\":\\"jose\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_owner\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"jose" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_docType\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"matt" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_docType\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"alex" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{\\"docType\\":\\"marble\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_docType\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"jose" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel1" using chaincode named "mycc1" with args ["queryMarbles", "{\\"selector\\":{ \\"color\\":\\"green\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_color\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"matt" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel2" using chaincode named "mycc2" with args ["queryMarbles", "{\\"selector\\":{ \\"color\\":\\"yellow\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_color\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"alex" from "peer1.org1.example.com"
    When a user queries on the channel "mychannel3" using chaincode named "mycc3" with args ["queryMarbles", "{\\"selector\\":{ \\"color\\":\\"red\\"}, \\"use_index\\":[\\"_design/indexdoc_behave_test\\", \\"index_behave_test_color\\"]}"] on "peer1.org1.example.com"
    Then a user receives a response containing "owner":"jose" from "peer1.org1.example.com"

    # Explicitly check with CouchDB to confirm the index is set up correctly for the rich query to pass using index
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_1" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_1":{"map":{"fields":{"owner":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_2" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_2":{"map":{"fields":{"docType":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc1" in the channel "mychannel1" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc2" in the channel "mychannel2" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container
    When a user requests to get the design doc "indexdoc_behave_test_3" for the chaincode named "mycc3" in the channel "mychannel3" and from the CouchDB instance "http://localhost:5984"
    Then a user receives success response of ["views":{"index_behave_test_3":{"map":{"fields":{"color":"asc"}] from the couchDB container

Examples:
    |                             cc_path                            |                      index_path                              | language  |  jira_num    |
    | github.com/hyperledger/fabric-samples/chaincode/marbles02/go   | github.com/hyperledger/fabric-samples/chaincode/marbles02/go | GOLANG    |  FAB-7259    |
    | ../../fabric-samples/chaincode/marbles02/node                  | ../fabric-samples/chaincode/marbles02/node                   | NODE      |  FAB-7262    |
