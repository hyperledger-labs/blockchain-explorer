# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#


Feature: Peer Service
    As a user I want to be able have channels and chaincodes to execute

#@doNotDecompose
@daily
Scenario Outline: FAB-3505: Test chaincode example02 deploy, invoke, and query, with <type> orderer
    Given I have a bootstrapped fabric network of type <type> <security>
    And I use the <interface> interface
    When an admin sets up a channel
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 1000
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "5" seconds
    And a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 990
    When "peer0.org2.example.com" is taken down
    And a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "5" seconds
    And "peer0.org2.example.com" comes back up
    And I wait "10" seconds
    And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
    Then a user receives a success response of 980 from "peer0.org2.example.com"
Examples:
    | type  |   security  |  interface |
    | solo  | without tls | NodeJS SDK |
    | kafka |   with tls  | NodeJS SDK |
    | solo  | without tls |     CLI    |
    | kafka |   with tls  |     CLI    |


@daily
Scenario Outline: FAB-1440, FAB-3861: Basic Chaincode Execution - <type> orderer type, using <database>, <security>
    Given I have a bootstrapped fabric network of type <type> using state-database <database> <security>
    When an admin sets up a channel
    And an admin deploys chaincode
    When a user queries on the chaincode
    Then a user receives a success response of 100
    When a user invokes on the chaincode
    And I wait "5" seconds
    And a user queries on the chaincode
    Then a user receives a success response of 95
Examples:
    | type  | database |  security   |
    | solo  | leveldb  |  with tls   |
    | solo  | leveldb  | without tls |
    | solo  | couchdb  |  with tls   |
    | solo  | couchdb  | without tls |
    | kafka | leveldb  |  with tls   |
    | kafka | leveldb  | without tls |
    | kafka | couchdb  |  with tls   |
    | kafka | couchdb  | without tls |


@daily
Scenario Outline: FAB-3865: Multiple Channels Per Peer, with <type> orderer
    Given I have a bootstrapped fabric network of type <type>
    When an admin sets up a channel named "chn1"
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init", "a", "1000" , "b", "2000"] with name "cc1" on channel "chn1"
    When an admin sets up a channel named "chn2"
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args ["init"] with name "cc2" on channel "chn2"
    When a user invokes on the channel "chn2" using chaincode named "cc2" with args ["put", "a", "1000"]
    And I wait "5" seconds
    And a user queries on the channel "chn2" using chaincode named "cc2" with args ["get", "a"]
    # the "map" chaincode adds quotes around the result
    Then a user receives a success response of "1000"
    When a user invokes on the channel "chn2" using chaincode named "cc2" with args ["put", "b", "2000"]
    And I wait "5" seconds
    And a user queries on the channel "chn2" using chaincode named "cc2" with args ["get", "b"]
    # the "map" chaincode adds quotes around the result
    Then a user receives a success response of "2000"
    When a user invokes on the channel "chn1" using chaincode named "cc1" with args ["invoke", "a", "b", "10"]
    And I wait "5" seconds
    And a user queries on the channel "chn1" using chaincode named "cc1" with args ["query", "a"]
    Then a user receives a success response of 990
    When a user queries on the channel "chn2" using chaincode named "cc2" with args ["get", "a"]
    # the "map" chaincode adds quotes around the result
    Then a user receives a success response of "1000"
Examples:
    | type  |
    | solo  |
    | kafka |


@daily
Scenario Outline: FAB-3866: Multiple Chaincodes Per Peer, with <type> orderer
    Given I have a bootstrapped fabric network of type <type>
    When an admin sets up a channel
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/eventsender" with args [] with name "eventsender"
    When a user invokes on the chaincode named "eventsender" with args ["invoke", "test_event"]
    And I wait "5" seconds
    And a user queries on the chaincode named "eventsender" with args ["query"]
    Then a user receives a success response of {"NoEvents":"1"}
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init", "a", "1000" , "b", "2000"] with name "example02"
    When a user invokes on the chaincode named "example02" with args ["invoke", "a", "b", "10"]
    And I wait "5" seconds
    And a user queries on the chaincode named "example02" with args ["query", "a"]
    Then a user receives a success response of 990
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args ["init"] with name "map"
    When a user invokes on the chaincode named "map" with args ["put", "a", "1000"]
    And I wait "5" seconds
    And a user queries on the chaincode named "map" with args ["get", "a"]
    # the "map" chaincode adds quotes around the result
    Then a user receives a success response of "1000"
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/marbles02" with args [] with name "marbles"
    When a user invokes on the chaincode named "marbles" with args ["initMarble", "marble1", "blue", "35", "tom"]
    And I wait "5" seconds
    And a user invokes on the chaincode named "marbles" with args ["transferMarble", "marble1", "jerry"]
    And I wait "5" seconds
    And a user queries on the chaincode named "marbles" with args ["readMarble", "marble1"]
    Then a user receives a success response of {"docType":"marble","name":"marble1","color":"blue","size":35,"owner":"jerry"}
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/sleeper" with args ["1"] with name "sleeper"
    When a user invokes on the chaincode named "sleeper" with args ["put", "a", "1000", "1"]
    And I wait "5" seconds
    And a user queries on the chaincode named "sleeper" with args ["get", "a", "1"]
    Then a user receives a success response of 1000
Examples:
    | type  |
    | solo  |
    | kafka |

Scenario: FAB-6333: A peer with chaincode container disconnects, comes back up, is able to resume regular operation
  Given I have a bootstrapped fabric network of type solo
  When an admin sets up a channel
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  And I wait "10" seconds

  # do 1 set of invoke-query on peer1.org1
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on "peer1.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org1.example.com"
  Then a user receives a success response of 990 from "peer1.org1.example.com"

  ## Now disconnect a peer
  When "peer1.org1.example.com" is taken down by doing a disconnect
  And I wait "15" seconds

  # do 2 set of invoke-query on peer0.org1
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"] on "peer0.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 970 from "peer0.org1.example.com"

  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"] on "peer0.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 940 from "peer0.org1.example.com"

  #bring back up the disconnected peer
  When "peer1.org1.example.com" comes back up by doing a connect
  And I wait "30" seconds

  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org1.example.com"
  Then a user receives a success response of 940 from "peer1.org1.example.com"

  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on "peer1.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org1.example.com"
  Then a user receives a success response of 900 from "peer1.org1.example.com"


@daily
Scenario Outline: FAB-7150/FAB-7153/FAB-7759: Test Mutual TLS/ClientAuth <security> with <type> based-orderer using <interface> interface
  Given the CORE_PEER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And the ORDERER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And I have a bootstrapped fabric network of type <type> <security>
  And I use the <interface> interface
  When an admin sets up a channel
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990

  When "peer0.org2.example.com" is taken down
  And a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  And "peer0.org2.example.com" comes back up
  And I wait "10" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 980 from "peer0.org2.example.com"

  When an admin queries for the first block
  Then an admin receives a response containing org1.example.com
  Then an admin receives a response containing org2.example.com
  Then an admin receives a response containing example.com
  Then an admin receives a response containing CERTIFICATE
Examples:
    | type  |   security  |  interface |
    | kafka |   with tls  | NodeJS SDK |
    | solo  |   with tls  | NodeJS SDK |
    | kafka |   with tls  |     CLI    |
    | solo  |   with tls  |     CLI    |
    | kafka | without tls |     CLI    |
    | solo  | without tls | NodeJS SDK |

@daily
Scenario: FAB-3855: Empty Payload Messages
    Given I have a bootstrapped fabric network of type kafka
    When an admin sets up a channel named "emptiness"
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args ["init"] with name "empty" on channel "emptiness"
    When a user invokes on the channel "emptiness" using chaincode named "empty" with args ["put", "a", ""]
    And I wait "5" seconds
    And a user queries on the channel "emptiness" using chaincode named "empty" with args ["get", "a"]
    # the "map" chaincode adds quotes around the result
    Then a user receives a success response of ""


@daily
Scenario: FAB-8379: Test MSP Identity - Happy Path
  Given I have a bootstrapped fabric network of type kafka with tls with organizational units enabled on all nodes
  When an admin sets up a channel
  And an admin deploys chaincode with args ["init","a","1000","b","2000"] with policy "OR ('org1.example.com.member','org2.example.com.member')"
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000
  # Endorsement policies not enforced during initialization
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990


@daily
Scenario: FAB-8380: Test MSP Identity - Malicious Peer
  Given the CORE_PEER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And the ORDERER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  Given the peer "peer1.org2.example.com" is setup to use a client identity
  And I have a bootstrapped fabric network of type kafka with tls with organizational units enabled on all nodes
  When an admin sets up a channel

  And an admin deploys chaincode with args ["init","a","1000","b","2000"] with policy "OR ('org1.example.com.peer','org2.example.com.peer')"
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000

  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on "peer1.org2.example.com"
  Then the logs on peer1.org2.example.com contains "VSCCValidateTx for transaction txId " within 10 seconds
  And the logs on peer1.org2.example.com contains "returned error: validation of endorsement policy for chaincode mycc in tx 2:0 failed: signature set did not satisfy policy" within 10 seconds
  And I wait "2" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000


@daily
Scenario: FAB-8381: Test MSP Identity - Malicious Peer (Clients set as writers in policy)
  Given the CORE_PEER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And the ORDERER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And I have a bootstrapped fabric network of type kafka with tls with organizational units enabled on all nodes
  When an admin sets up a channel
  And an admin deploys chaincode with args ["init","a","1000","b","2000"] with policy "OR ('org1.example.com.client','org2.example.com.client')"

  When the admin changes the policy to "OR ('org1.example.com.client','org2.example.com.client')"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 1000 from "peer0.org2.example.com"
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000

  When a user using a peer identity invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  Then the logs on peer0.org2.example.com contains "VSCCValidateTx for transaction txId " within 10 seconds
  And the logs on peer0.org2.example.com contains "returned error: validation of endorsement policy for chaincode mycc in tx 2:0 failed: signature set did not satisfy policy" within 10 seconds
  And I wait "2" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000


@daily
Scenario: FAB-8382: Test MSP Identity with inconsistencies
  Given the CORE_PEER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And the ORDERER_TLS_CLIENTAUTHREQUIRED environment variable is "true"
  And I have a bootstrapped fabric network of type kafka with tls with organizational units enabled on all Org1ExampleCom nodes
  When an admin sets up a channel
  And an admin deploys chaincode with args ["init","a","1000","b","2000"] with policy "OR ('org1.example.com.peer','org2.example.com.peer')"
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 1000 from "peer0.org2.example.com"

  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on "peer0.org2.example.com"
  Then the logs on peer0.org2.example.com contains "VSCCValidateTx for transaction txId " within 10 seconds
  And the logs on peer0.org2.example.com contains "returned error: validation of endorsement policy for chaincode mycc in tx 2:0 failed: signature set did not satisfy policy" within 10 seconds
  And I wait "2" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000

@daily
Scenario: FAB-8759: Test querying a peer with two different versions of chaincode - values change
  Given I have a bootstrapped fabric network of type kafka with tls
  When an admin sets up a channel named "versioningtest"
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init", "a", "1000" , "b", "2000"] with name "vt" on channel "versioningtest"
  When a user queries on the channel "versioningtest" using chaincode named "vt" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000
  When a user invokes on the channel "versioningtest" using chaincode named "vt" with args ["invoke","a","b","10"] on "peer0.org2.example.com"
  And I wait "5" seconds
  When a user queries on the channel "versioningtest" using chaincode named "vt" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 990

  When an admin installs chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" as version "3" with args ["init","a","1000","b","2000"] with name "vt" on all peers
  And I wait "5" seconds
  When an admin upgrades the chaincode with name "vt" on channel "versioningtest" to version "3" on peer "peer0.org1.example.com" with args ["init","a","1000","b","2000"]
  #When an admin upgrades the chaincode on channel "versioningtest" to version "3" on peer "peer0.org1.example.com"
  When a user queries on version "3" of the channel "versioningtest" using chaincode named "vt" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 1000
  When a user queries on version "0" of the channel "versioningtest" using chaincode named "vt" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 1000 from "peer0.org2.example.com"


@daily
Scenario: FAB-8759: Test querying a peer that has two different versions of chaincode - no change in data
  Given I have a bootstrapped fabric network of type kafka with tls
  When an admin sets up a channel named "versioningtest"
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args ["init"] with name "vt" on channel "versioningtest"
  When a user invokes on the channel "versioningtest" using chaincode named "vt" with args ["put","a","1000"] on "peer0.org2.example.com"
  When a user invokes on the channel "versioningtest" using chaincode named "vt" with args ["put","b","2000"] on "peer0.org1.example.com"
  When a user invokes on the channel "versioningtest" using chaincode named "vt" with args ["put","c","3000"] on "peer1.org1.example.com"
  And I wait "5" seconds
  When a user queries on the channel "versioningtest" using chaincode named "vt" with args ["get","a"] on "peer1.org2.example.com"
  Then a user receives a success response of "1000" from "peer1.org2.example.com"
  When a user queries on the channel "versioningtest" using chaincode named "vt" with args ["get","c"] on "peer1.org2.example.com"
  Then a user receives a success response of "3000" from "peer1.org2.example.com"

  When an admin installs chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" as version "4" with args ["init"] with name "vt" on all peers
  And I wait "5" seconds
  When an admin upgrades the chaincode with name "vt" on channel "versioningtest" to version "4" on peer "peer0.org1.example.com" with args ["init"]
  When a user queries on version "4" of the channel "versioningtest" using chaincode named "vt" with args ["get","a"] on "peer0.org1.example.com"
  Then a user receives a success response of "1000"
  When a user queries on version "0" of the channel "versioningtest" using chaincode named "vt" with args ["get","c"] on "peer0.org2.example.com"
  Then a user receives a success response of "3000" from "peer0.org2.example.com"

@daily
Scenario: FAB-7407: Update the channel policies - add an organization
  Given I have a bootstrapped fabric network of type solo with tls
  When an admin sets up a channel
  And an admin deploys chaincode with args ["init","a","1000","b","2000"]
  When a user invokes on the chaincode with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode with args ["query","a"]
  Then a user receives a success response of 990

  When an admin adds an organization to the channel config
  # Assume channel config file is distributed out of band
  And all organization admins sign the updated channel config
  When the admin updates the channel using peer "peer0.org1.example.com"

  When an admin fetches genesis information using peer "peer0.org1.example.com"
  Then the config block file is fetched from peer "peer0.org1.example.com"
  Then the updated config block contains Org3ExampleCom

  When a user invokes on the chaincode with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode with args ["query","a"]
  Then a user receives a success response of 980

  When the peers from the added organization are added to the network

  When an admin fetches genesis information at block 0 using peer "peer0.org3.example.com"
  When an admin makes peer "peer0.org3.example.com" join the channel
  And an admin makes peer "peer1.org3.example.com" join the channel
  When an admin installs chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" as version "2" with args ["init","a","1000","b","2000"] on all peers
  And I wait "5" seconds
  When an admin upgrades the chaincode to version "2" on peer "peer0.org1.example.com" with args ["init","a","1000","b","2000"]

  When a user queries on the chaincode with args ["query","a"] from "peer0.org3.example.com"
  Then a user receives a success response of 1000 from "peer0.org3.example.com"

  When a user invokes on the chaincode with args ["invoke","a","b","10"] on "peer0.org2.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode with args ["query","a"]
  Then a user receives a success response of 990
  When a user invokes on the chaincode with args ["invoke","a","b","10"] on "peer1.org3.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode with args ["query","a"]
  Then a user receives a success response of 980

  When an admin fetches genesis information using peer "peer0.org1.example.com"
  Then the config block file is fetched from peer "peer0.org1.example.com"
  When an admin removes an organization named Org2ExampleCom from the channel config
  And all organization admins sign the updated channel config
  When the admin updates the channel using peer "peer0.org1.example.com"

  When an admin fetches genesis information using peer "peer0.org1.example.com"
  Then the config block file is fetched from peer "peer0.org1.example.com"
  Then the updated config block does not contain Org2ExampleCom

  When a user invokes on the chaincode with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode with args ["query","a"]
  Then a user receives a success response of 970
  When a user queries on the chaincode with args ["query","a"] from "peer0.org2.example.com"
  Then a user receives a success response of 980 from "peer0.org2.example.com"
