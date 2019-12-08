# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

Feature: Gossip Service
    As a user I expect the gossip component work correctly

@daily
Scenario Outline: [FAB-4663] [FAB-4664] [FAB-4665] A non-leader peer goes down by <takeDownType>, comes back up and catches up eventually.
  Given the FABRIC_LOGGING_SPEC environment variable is gossip.election=DEBUG
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on the initial leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 1000 from the initial leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 990 from the initial leader peer of "org1"

  When the initial non-leader peer of "org1" is taken down by doing a <takeDownType>
  And I wait "5" seconds
  ## Now do 3 invoke-queries in leader peer
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 980 from the initial leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"] on the initial leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 960 from the initial leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"] on the initial leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 930 from the initial leader peer of "org1"

  When the initial non-leader peer of "org1" comes back up by doing a <bringUpType>
  And I wait "60" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 930 from the initial non-leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 890 from the initial leader peer of "org1"

  Examples:
    | takeDownType | bringUpType |
    |  stop        | start       |
    |  pause       | unpause     |
    | disconnect   | connect     |

@daily
Scenario Outline: [FAB-4667] [FAB-4671] [FAB-4672] A leader peer goes down by <takeDownType>, comes back up *after* another leader is elected, catches up.
  Given the FABRIC_LOGGING_SPEC environment variable is gossip.election=DEBUG
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on the initial non-leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 1000 from the initial non-leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 990 from the initial non-leader peer of "org1"

  When the initial leader peer of "org1" is taken down by doing a <takeDownType>
  # Give time to leader change to happen
  And I wait "30" seconds
  Then the initial non-leader peer of "org1" has become the leader
  ## Now do 3 invoke-queries
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 980 from the initial non-leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 960 from the initial non-leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 930 from the initial non-leader peer of "org1"

  When the initial leader peer of "org1" comes back up by doing a <bringUpType>
  And I wait "60" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 930 from the initial leader peer of "org1"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on the initial leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 890 from the initial leader peer of "org1"

  Examples:
    | takeDownType | bringUpType |
    |  stop        | start       |
    |  pause       | unpause     |
    | disconnect   | connect     |

@daily
Scenario Outline: [FAB-4673] [FAB-4674] [FAB-4675] A leader peer goes down by <takeDownType>, comes back up *before* another leader is elected, catches up.
  Given the FABRIC_LOGGING_SPEC environment variable is gossip.election,peer.gossip=DEBUG
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on the initial non-leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 1000 from the initial non-leader peer of "org1"

  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial non-leader peer of "org1"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on the initial non-leader peer of "org1"
  Then a user receives a success response of 990 from the initial non-leader peer of "org1"

  ## take down leader, invoke in non-leader, wait 5 seconds and bring back up the initial leader
  When the initial leader peer of "org1" is taken down by doing a <takeDownType>
  And a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on the initial non-leader peer of "org1"
  And I wait "3" seconds
  Then the initial non-leader peer of "org1" has not become the leader
  When the initial leader peer of "org1" comes back up by doing a <bringUpType>
  And I wait "30" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"] on the initial leader peer of "org1"
  Then a user receives a success response of 980 from the initial leader peer of "org1"

  Examples:
    | takeDownType | bringUpType |
    |  stop        | start       |
    |  pause       | unpause     |
    | disconnect   | connect     |

@daily
Scenario Outline: [FAB-4676] [FAB-4677] [FAB-4678] "All peers in an organization go down via <takeDownType>, then catch up after <bringUpType>".
  Given the FABRIC_LOGGING_SPEC environment variable is gossip.election=DEBUG
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 980

  #take down both peers in "org2"
  When "peer0.org2.example.com" is taken down by doing a <takeDownType>
  And I wait "5" seconds
  When "peer1.org2.example.com" is taken down by doing a <takeDownType>
  And I wait "5" seconds
  ## Now do 3 invoke-queries in a peer from org1
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 970
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 950
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 920

  When "peer0.org2.example.com" comes back up by doing a <bringUpType>
  And I wait "60" seconds
  When "peer1.org2.example.com" comes back up by doing a <bringUpType>
  And I wait "60" seconds

  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 920 from "peer0.org2.example.com"
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org2.example.com"
  Then a user receives a success response of 920 from "peer1.org2.example.com"

  Examples:
    | takeDownType | bringUpType |
    |  stop        | start       |
    |  pause       | unpause     |
    | disconnect   | connect     |

@daily
Scenario Outline: [FAB-4679] [FAB-4680] [FAB-4681] In leader-selection setup, a non-leader peer goes down by <takeDownType>, comes back up and catches up eventually.
  # Select Peer0 of both org as leader and turn leader election off

  Given the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG1 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG2 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG2 environment variable is false

  # Bootstrap the network create channel, deploy chaincode
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"

  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990

  # Take down the non-leader peer
  When "peer1.org1.example.com" is taken down by doing a <takeDownType>
  And I wait "5" seconds

  # Now do three invoke-query pairs
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"] on "peer0.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 980 from "peer0.org1.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"] on "peer0.org1.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 960 from "peer0.org1.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"] on "peer0.org1.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 930 from "peer0.org1.example.com"

  # Bring back up the non-leader peer
  When "peer1.org1.example.com" comes back up by doing a <bringUpType>
  And I wait "60" seconds

  # Test with the non-leader peer
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org1.example.com"
  Then a user receives a success response of 930 from "peer1.org1.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on "peer1.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org1.example.com"
  Then a user receives a success response of 890 from "peer1.org1.example.com"

  Examples:
    | takeDownType | bringUpType |
    |  stop        | start       |
    |  pause       | unpause     |
    | disconnect   | connect     |

@daily
Scenario Outline: [FAB-4683] [FAB-4684] [FAB-4685] In leader-selection setup, leader peer goes down by <takeDownType> for at least <minDownDuration> seconds, comes back up and catches up eventually.

  # Select Peer0 of both org as leader and turn leader election off
  Given the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG1 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG2 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG2 environment variable is false

  # Bootstrap the network create channel, deploy chaincode
  And I have a bootstrapped fabric network of type kafka
  When an admin sets up a channel
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 1000
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990

  # Take down the leader peer
  When "peer0.org2.example.com" is taken down by doing a <takeDownType>
  And I wait "5" seconds

  # Now do three invoke-query pairs
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"] on "peer0.org1.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 970 from "peer0.org1.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"] on "peer0.org1.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 940 from "peer0.org1.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on "peer0.org1.example.com"
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org1.example.com"
  Then a user receives a success response of 900 from "peer0.org1.example.com"

  When I wait "<minDownDuration>" seconds

  # Bring back up the leader peer
  When "peer0.org2.example.com" comes back up by doing a <bringUpType>
  And I wait "60" seconds

  # Query the leader peer
  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer0.org2.example.com"
  Then a user receives a success response of 900 from "peer0.org2.example.com"

  Examples:
    | takeDownType | bringUpType   | minDownDuration |
    |  stop        | start         |    15        |
    |  pause       | unpause       |    15        |
    | disconnect   | connect       |    15        |
    |  stop        | start         |    90        |
    |  pause       | unpause       |    90        |
    | disconnect   | connect       |    90        |


@daily
  Scenario: [FAB-4666] A non-leader peer, that joins an already-active channel--is expected to have all the blocks eventually.

  Given the FABRIC_LOGGING_SPEC environment variable is gossip=DEBUG
  And I have a bootstrapped fabric network of type kafka
  When an admin creates a channel

  #Join only three peers
  When an admin fetches genesis information using peer "peer0.org1.example.com"
  And an admin fetches genesis information using peer "peer0.org2.example.com"
  And an admin fetches genesis information using peer "peer1.org1.example.com"
  And an admin makes peer "peer0.org1.example.com" join the channel
  And an admin makes peer "peer0.org2.example.com" join the channel
  And an admin makes peer "peer1.org1.example.com" join the channel

  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  And I wait "5" seconds
  ## Now do 3 invoke-queries in leader peer
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 970
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 940

  #Join the rest of the peers
  When an admin fetches genesis information using peer "peer1.org2.example.com"
  And an admin makes peer "peer1.org2.example.com" join the channel

  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org2.example.com"
  Then a user receives a success response of 940 from "peer1.org2.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on "peer1.org2.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org2.example.com"
  Then a user receives a success response of 900 from "peer1.org2.example.com"


@daily
  Scenario: [FAB-4682] In leader-selection, a non-leader peer, that joins an already-active channel--is expected to have all the blocks eventually.

  # Select Peer0 of both org as leader and turn leader election off
  Given the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG1 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER0_ORG2 environment variable is true
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER0_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG1 environment variable is false
  And the CORE_PEER_GOSSIP_ORGLEADER_PEER1_ORG2 environment variable is false
  And the CORE_PEER_GOSSIP_USELEADERELECTION_PEER1_ORG2 environment variable is false

  And I have a bootstrapped fabric network of type kafka
  When an admin creates a channel

  #Join only three peers
  When an admin fetches genesis information using peer "peer0.org1.example.com"
  And an admin fetches genesis information using peer "peer0.org2.example.com"
  And an admin fetches genesis information using peer "peer1.org1.example.com"
  And an admin makes peer "peer0.org1.example.com" join the channel
  And an admin makes peer "peer0.org2.example.com" join the channel
  And an admin makes peer "peer1.org1.example.com" join the channel

  # the following wait is for Gossip leadership states to be stabilized
  And I wait "30" seconds
  And an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc"
  And I wait "5" seconds
  ## Now do 3 invoke-queries in leader peer
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","10"]
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 990
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","20"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 970
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","30"]
  And I wait "5" seconds
  When a user queries on the chaincode named "mycc" with args ["query","a"]
  Then a user receives a success response of 940

  #Join the rest of the peers
  When an admin fetches genesis information using peer "peer1.org2.example.com"
  And an admin makes peer "peer1.org2.example.com" join the channel

  When a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org2.example.com"
  Then a user receives a success response of 940 from "peer1.org2.example.com"
  When a user invokes on the chaincode named "mycc" with args ["invoke","a","b","40"] on "peer1.org2.example.com"
  And I wait "5" seconds
  And a user queries on the chaincode named "mycc" with args ["query","a"] on "peer1.org2.example.com"
  Then a user receives a success response of 900 from "peer1.org2.example.com"
