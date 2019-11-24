# SPDX-License-Identifier: Apache-2.0

Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

@sanitycheck
# @doNotDecompose
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

    When I make a POST request to "auth/login" with parameters
    |user  |password   |network       |
    |test  |test       |first-network |
    Then the response status code should equal 200
    Then the response structure should equal "loginResp"
    Then JSON at path ".success" should equal true
    Then JSON at path ".user.message" should equal "logged in"
    Then JSON at path ".user.name" should equal "test"

    Given I want to reuse "token" parameter
    Given I set Authorization header to "context.token"
    When I make a GET request to "api/channels"
    Then the response status code should equal 200
    Then the response structure should equal "channelsResp"
    Then JSON at path ".channels" should equal ["mychannel"]

    When I make a GET request to "api/channels/info"
    Then the response status code should equal 200
    Then the response structure should equal "channelsInfoResp"
    Then JSON at path ".status" should equal 200
    Then JSON at path ".channels[0].channelname" should equal "mychannel"

    Given I want to reuse parameter "channel_genesis_hash" at path "channels[0].channel_genesis_hash"
    Given I want to reuse parameter "block_height" at path "channels[0].blocks"

    # Building API route path by using variables stored in the context
    When I make a GET request to the following path segment
    # api/block/<context.channel_genesis_hash>/<context.block_height - 1>
    |path                           |
    |api                            |
    |block                          |
    |context.channel_genesis_hash   |
    |context.block_height           |
    Then the response status code should equal 200
    Then the response structure should equal "blockResp"
    Then JSON at path ".status" should equal 200

    When I make a GET request to "api/peersStatus/mychannel"
    Then the response status code should equal 200
    Then the response structure should equal "peersStatusResp"
    Then JSON at path ".status" should equal 200
    # TODO Currently the list in the response is empty

    When I make a GET request to the following path segment
    # api/blockActivity/<context.channel_genesis_hash>
    |path                           |
    |api                            |
    |blockActivity                  |
    |context.channel_genesis_hash   |
    Then the response status code should equal 200
    Then the response structure should equal "blockactivityResp"
    Then JSON at path ".status" should equal 200
    Then JSON at path ".row[0].channelname" should equal "mychannel"

    Examples:
    |consensus_type|
    |solo          |
    |kafka         |

@sanitycheck
# @doNotDecompose
Scenario Outline: Register a new user successfully using <type> based orderer with a <database> db using the <interface> with <language> chaincode
    Given I have a bootstrapped fabric network of type <type> using state-database <database> with tls
    Given Copy "./bin/fabric-ca-client" to "/usr/local/bin/fabric-ca-client" on "peer0.org1.example.com"
    Given Copy "./bin/fabric-ca-client" to "/usr/local/bin/fabric-ca-client" on "peer0.org2.example.com"
    And I use the <interface> interface
    And I enroll the following users using fabric-ca
        | username  |   organization   | password |  role  | certType |
        |  latitia  | org1.example.com |  h3ll0   | admin  |   x509   |
        |   scott   | org2.example.com |  th3r3   | member |   x509   |
        |   adnan   | org1.example.com |  wh@tsup | member |   x509   |
    When an admin sets up a channel named "mychannel"
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on channel "mychannel"
    When a user invokes on the channel "mychannel" using chaincode named "mycc" with args ["invoke","a","b","10"]
    When I wait "3" seconds
    When a user queries on the channel "mychannel" using chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 990

    Given the NETWORK_PROFILE environment variable is balance-transfer
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Please open web browser to access ：" within 20 seconds

    # Need to wait enough until completing process a new BlockEvent
    Given I wait "20" seconds
    Given I set base URL to "http://localhost:8090"

    When I make a POST request to "auth/login" with parameters
    |user    |password   |network             |
    |latitia |h3ll0      |balance-transfer    |
    Then the response status code should equal 200
    Then the response structure should equal "loginResp"
    Then JSON at path ".success" should equal true
    Then JSON at path ".user.message" should equal "logged in"
    Then JSON at path ".user.name" should equal "latitia"

    Given I want to reuse "token" parameter
    Given I set Authorization header to "context.token"

    When I make a POST request to "api/register" with parameters
    |user   |password   |affiliation |role   |
    |test2  |test2      |example.com |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 200

    # duplicate call : api/register (fail)
    When I make a POST request to "api/register" with parameters
    |user   |password   |affiliation |role   |
    |test2  |test2      |example.com |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 400
    Then the response parameter "message" should equal "Error: already exists"

Examples:
    | type  | database | interface  |                          path                                     | language |
    #| solo  | leveldb  |  Java SDK  | github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd |  GOLANG  |
    | solo  | leveldb  | NodeJS SDK | github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd |  GOLANG  |
    # | kafka | couchdb  |    CLI     |        ../../fabric-test/chaincodes/example02/node                |   NODE   |
    # | solo  | leveldb  | NodeJS SDK |   ../../fabric-samples/chaincode/chaincode_example02/java         |   JAVA   |

@bugfix
# @doNotDecompose
Scenario: Check a variety of error cases
    Given I have a bootstrapped fabric network of type kafka
    Given the NETWORK_PROFILE environment variable is solo-tls-disabled

    # [BE-583] Memory Leak : Channel Event Hub shoud be created just once
    When an admin sets up a channel named "mychannel"
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Please open web browser to access ：" within 20 seconds
    Then the explorer app logs contains "Successfully created channel event hub for" 1 time(s) within 60 seconds

    # Not supported to register a new user in network without fabric-ca
    Given I set base URL to "http://localhost:8090"
    When I make a POST request to "auth/login" with parameters
    |user   |password   |network        |
    |test1  |test1      |first-network  |
    Then the response status code should equal 200
    Then the response structure should equal "loginResp"
    Then JSON at path ".success" should equal true
    Then JSON at path ".user.message" should equal "logged in"
    Then JSON at path ".user.name" should equal "test1"

    Given I want to reuse "token" parameter
    Given I set Authorization header to "context.token"

    When I make a POST request to "api/register" with parameters
    |user   |password   |affiliation |role   |
    |test2  |test2      |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 400
    Then the response parameter "message" should equal "Error: did not register with CA"

    # [BE-603] Create a channel with long channel name
    # [BE-713] Detect a newly added channel
    When an admin sets up a channel named "channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422"
    Then the explorer app logs contains "Channel genesis hash for channel \[channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422\]" within 60 seconds

    # [BE-690] Keep explorer running after losing the default orderer
    When "orderer0.example.com" is stopped
    Then the explorer app logs contains "Succeeded to switch default orderer to orderer1.example.com" within 30 seconds
    Given I wait "20" seconds
    When "orderer1.example.com" is stopped
    Then the explorer app logs contains "Succeeded to switch default orderer to orderer2.example.com" within 30 seconds
