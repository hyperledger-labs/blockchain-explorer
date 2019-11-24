#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

Feature: Orderer Service
    As a user I want to be able to have my transactions ordered correctly

#@doNotDecompose
@skip
Scenario: FAB-1335: Resilient Kafka Orderer and Brokers
    Given the KAFKA_DEFAULT_REPLICATION_FACTOR environment variable is 1
    And the CONFIGTX_ORDERER_BATCHSIZE_MAXMESSAGECOUNT environment variable is 10
    And the CONFIGTX_ORDERER_BATCHTIMEOUT environment variable is 10 minutes
    And I have a bootstrapped fabric network of type kafka
    When 10 unique messages are broadcasted
    Then I get 10 successful broadcast responses
    #When the topic partition leader is stopped
    When I stop the current kafka topic partition leader
    And 10 unique messages are broadcasted
    Then I get 10 successful broadcast responses
    And all 20 messages are delivered in 1 block

@skip
Scenario: FAB-1306: Adding a new Kafka Broker
    Given a kafka cluster
    And an orderer connected to the kafka cluster
    When a new organization NewOrg certificate is added
    Then the NewOrg is able to connect to the kafka cluster

@skip
Scenario: FAB-1306: Multiple organizations in a kafka cluster, remove 1
    Given a certificate from Org1 is added to the kafka orderer network
    And a certificate from Org2 is added to the kafka orderer network
    And an orderer connected to the kafka cluster
    When authorization for Org2 is removed from the kafka cluster
    Then the Org2 cannot connect to the kafka cluster

@skip
Scenario: FAB-1306: Multiple organizations in a cluster - remove all, reinstate 1.
    Given a certificate from Org1 is added to the kafka orderer network
    And a certificate from Org2 is added to the kafka orderer network
    And a certificate from Org3 is added to the kafka orderer network
    And an orderer connected to the kafka cluster
    When authorization for Org2 is removed from the kafka cluster
    Then the Org2 cannot connect to the kafka cluster
    And the orderer functions successfully
    When authorization for Org1 is removed from the kafka cluster
    Then the Org1 cannot connect to the kafka cluster
    And the orderer functions successfully
    When authorization for Org3 is removed from the kafka cluster
    Then the Org3 cannot connect to the kafka cluster
    And the zookeeper notifies the orderer of the disconnect
    And the orderer stops sending messages to the cluster
    When authorization for Org1 is added to the kafka cluster
    And I wait "15" seconds
    Then the Org1 is able to connect to the kafka cluster
    And the orderer functions successfully


@smoke
Scenario: FAB-3852: Message Payloads Less than 1MB, for kafka-based orderer using the NodeJS SDK interface
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb with tls
    And I use the NodeJS SDK interface
    # Following lines are equivaent to "When an admin sets up a channel"
    When an admin creates a channel
    When an admin fetches genesis information using peer "peer0.org1.example.com"
    When an admin makes all peers join the channel
    # Following lines are equivalent to "When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args [""]"
    When an admin installs chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args [""] on all peers
    When an admin instantiates the chaincode on "peer0.org1.example.com"

    # 1K
    And a user invokes on the chaincode named "mycc" with random args ["put","a","{random_value}"] of length 1024
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","a"]
    Then a user receives a response containing a value of length 1024
    And a user receives a response with the random value
    # 64K
    When a user invokes on the chaincode named "mycc" with random args ["put","b","{random_value}"] of length 65536
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","b"]
    Then a user receives a response containing a value of length 65536
    #
    When a user invokes on the chaincode named "mycc" with random args ["put","d","{random_value}"] of length 100000
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","d"]
    Then a user receives a response containing a value of length 100000
    #
    When a user invokes on the chaincode named "mycc" with random args ["put","g","{random_value}"] of length 130610
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","g"]
    Then a user receives a response containing a value of length 130610
    And a user receives a response with the random value


@daily
Scenario Outline: FAB-3852: Message Payloads Less than 1MB, for <type> orderer using the <interface> interface
    Given I have a bootstrapped fabric network of type <type>
    And I use the <interface> interface
    # Following lines are equivaent to "When an admin sets up a channel"
    When an admin creates a channel
    When an admin fetches genesis information using peer "peer0.org1.example.com"
    When an admin makes all peers join the channel
    # Following lines are equivalent to "When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args [""]"
    When an admin installs chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args [""] on all peers
    When an admin instantiates the chaincode on "peer0.org1.example.com"

    # 1K
    And a user invokes on the chaincode named "mycc" with random args ["put","a","{random_value}"] of length 1024
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","a"]
    Then a user receives a response containing a value of length 1024
    And a user receives a response with the random value
    # 64K
    When a user invokes on the chaincode named "mycc" with random args ["put","b","{random_value}"] of length 65536
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","b"]
    Then a user receives a response containing a value of length 65536
    #
    When a user invokes on the chaincode named "mycc" with random args ["put","d","{random_value}"] of length 100000
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","d"]
    Then a user receives a response containing a value of length 100000
    #
    When a user invokes on the chaincode named "mycc" with random args ["put","g","{random_value}"] of length 130610
    And I wait "3" seconds
    And a user queries on the chaincode named "mycc" with args ["get","g"]
    Then a user receives a response containing a value of length 130610
    And a user receives a response with the random value
Examples:
    | type  |  interface |
    | solo  |     CLI    |
    | kafka |     CLI    |
    | solo  | NodeJS SDK |
    | kafka | NodeJS SDK |


@daily
Scenario Outline: FAB-3851: Message Payloads of size <comment>, for <type> orderer
    Given I have a bootstrapped fabric network of type <type> using state-database couchdb
    And I use the NodeJS SDK interface
    When an admin sets up a channel
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args [""]

    When a user invokes on the chaincode named "mycc" with random args ["put","g","{random_value}"] of length <size>
    And I wait "7" seconds
    And a user queries on the chaincode named "mycc" with args ["get","g"]
    Then a user receives a response containing a value of length <size>
    And a user receives a response with the random value

    When a user invokes on the chaincode named "mycc" with random args ["put","g","{random_value}"] of length <size>
    And I wait "7" seconds
    And a user queries on the chaincode named "mycc" with args ["get","g"]
    Then a user receives a response containing a value of length <size>
    And a user receives a response with the random value
Examples:
    | type  |  size   |         comment              |
    | solo  | 1048576 |           1MB                |
    | solo  | 2097152 |           2MB                |
    | solo  | 4194304 |           4MB                |
    | kafka |  125000 | 125KB (with default msg size) |
    | kafka |  320000 | 320KB (with default msg size) |
    | kafka |  490000 | 490KB (with default msg size) |
    #| kafka | 1000012 |   1MB   |


@daily
Scenario Outline: FAB-3859: Kafka Network with Large Message Size <comment> with Configuration Tweaks
  Given the ORDERER_ABSOLUTEMAXBYTES environment variable is <absoluteMaxBytes>
  And the ORDERER_PREFERREDMAXBYTES environment variable is <preferredMaxBytes>
  And the KAFKA_MESSAGE_MAX_BYTES environment variable is <messageMaxBytes>
  And the KAFKA_REPLICA_FETCH_MAX_BYTES environment variable is <replicaFetchMaxBytes>
  And the KAFKA_REPLICA_FETCH_RESPONSE_MAX_BYTES environment variable is <replicaFetchResponseMaxBytes>
  Given I have a bootstrapped fabric network of type kafka
  And I use the NodeJS SDK interface
  When an admin sets up a channel named "configsz"
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/map" with args ["init"] with name "mapIt" on channel "configsz"

  When a user invokes on the channel "configsz" using chaincode named "mapIt" with random args ["put","g","{random_value}"] of length <size>
  And I wait "10" seconds
  And a user queries on the channel "configsz" using chaincode named "mapIt" for the random key with args ["get","g"] on "peer0.org1.example.com"
  Then a user receives a response containing a value of length <size>
  And a user receives a response with the random value
Examples:
    | absoluteMaxBytes | preferredMaxBytes | messageMaxBytes | replicaFetchMaxBytes | replicaFetchResponseMaxBytes |   size   | comment |
    |     20 MB        |      2 MB         |     4 MB        |        2 MB          |           20 MB              |  1048576 |   1MB   |
    |      1 MB        |      1 MB         |     4 MB        |        2 MB          |           10 MB              |  1048576 |   1MB   |
    |      1 MB        |      1 MB         |     4 MB        |       1.5 MB         |           10 MB              |  1048576 |   1MB   |
    |      4 MB        |      4 MB         |     4 MB        |        4 MB          |           10 MB              |  1048576 |   1MB   |
    |      8 MB        |      8 MB         |     8 MB        |        8 MB          |           10 MB              |  2097152 |   2MB   |
    |     16 MB        |     16 MB         |    16 MB        |       16 MB          |           20 MB              |  4194304 |   4MB   |
    |     11 MB        |      2 MB         |    22 MB        |       11 MB          |           20 MB              | 10485760 |   10MB  |

@daily
Scenario Outline: FAB-3857: <count> key/value pairs in Payloads of size <size>
    Given I have a bootstrapped fabric network of type kafka using state-database couchdb
    And I use the NodeJS SDK interface
    When an admin sets up a channel
    When an admin deploys chaincode at path "github.com/hyperledger/fabric-test/chaincodes/mapkeys/go" with args [""]

    When a user invokes on the chaincode named "mycc" with args ["put","c","3F","d","76D"]
    When I wait "5" seconds
    And a user queries on the chaincode named "mycc" with args ["get","c"]
    Then a user receives a success response of 3F
    When a user queries on the chaincode named "mycc" with args ["get","d"]
    Then a user receives a success response of 76D

    When a user invokes args with <count> random key/values of length <size> on the chaincode named "mycc"
    And I wait "5" seconds
    And a user queries on the chaincode named "mycc" with dynamic args ["get","{last_key}"] on "peer0.org1.example.com"
    Then a user receives a response containing a value of length <size>
    And a user receives a response with the random value
Examples:
    |  size  |  count  |                  comment                         |
    #|  2048  |   20    | caused IOError: resource temporarily unavailable |
    |   512  |   10    |                                                  |
    #|  256   |  1024   | caused IOError: resource temporarily unavailable |
    |   64   |   256   |                                                  |


#@daily
Scenario: FAB-4686: Test taking down all kafka brokers and bringing back last 3
    Given I have a bootstrapped fabric network of type kafka
    When an admin sets up a channel
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    And a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 990

    When "kafka0" is taken down
    And I wait "5" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    When a user queries on the chaincode with args ["query","a"]
    Then a user receives a success response of 980

    When "kafka1" is taken down
    And "kafka2" is taken down
    And "kafka3" is taken down
    And I wait "5" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    And a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 980
    And I wait "5" seconds

    When "kafka3" comes back up
    And I wait "60" seconds
    And "kafka2" comes back up
    And I wait "60" seconds
    And "kafka1" comes back up
    And I wait "90" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 970


# skip FAB-4770 until FAB-6335 gets fixed so that we reliably stop the correct kafkabroker
@skip
@daily
Scenario Outline: [FAB-4770] [FAB-4845]: <takeDownType> all kafka brokers in the RF set, and <bringUpType> in LIFO order
    # By default, the number of kafka brokers in the RF set is 3(KAFKA_DEFAULT_REPLICATION_FACTOR),
    # and the min ISR is 2(KAFKA_MIN_INSYNC_REPLICAS)
    Given I have a bootstrapped fabric network of type kafka
    When an admin sets up a channel
    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "5" seconds
    And a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 990

    When I <takeDownType> the current kafka topic partition leader
    And I wait "60" seconds
    Then the broker is reported as down
    And ensure kafka ISR set contains 2 brokers
    #new leader is elected
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "5" seconds
    When a user queries on the chaincode with args ["query","a"]
    Then a user receives a success response of 980

    When I <takeDownType> the current kafka topic partition leader
    And I wait "65" seconds
    Then the broker is reported as down
    And ensure kafka ISR set contains 1 brokers
    And I wait "10" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "60" seconds
    # Do not do this service_unavailable check, to see query value returned for an error
    #Then a user receives an error response of SERVICE_UNAVAILABLE
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 980

    When I <takeDownType> the current kafka topic partition leader
    And I wait "60" seconds
    #Then the broker is reported as down
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    Then a user receives an error response of SERVICE_UNAVAILABLE
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 980

    # Stopping Queue: Last In First Out
    When I <bringUpType> a former kafka topic partition leader
    And I wait "60" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 980

    When I <bringUpType> a former kafka topic partition leader
    And I wait "60" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 970

    When I <bringUpType> a former kafka topic partition leader
    And I wait "60" seconds
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "10" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 960
    Examples:
        | takeDownType | bringUpType |
        | stop         | start       |
        | pause        | unpause     |
        | disconnect   | connect     |

@daily
Scenario Outline: FAB-4808,FAB-3937,FAB-3938: Orderer_BatchTimeOut is honored, for <type> orderer
    Given the CONFIGTX_ORDERER_BATCHTIMEOUT environment variable is <envValue>
    And I have a bootstrapped fabric network of type <type>
    When an admin sets up a channel
    And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 1000
    When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
    And I wait "5" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of <firstQuery>
    And I wait "16" seconds
    When a user queries on the chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of <lastQuery>
Examples:
    | type  |  envValue  | firstQuery | lastQuery |
    | solo  | 2 seconds  |    990     |   990     |
    | kafka | 2 seconds  |    990     |   990     |
    | solo  | 20 seconds |    1000    |   990     |
    | kafka | 20 seconds |    1000    |   990     |
