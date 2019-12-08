#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

Feature: Ledger Service
    As a user I want to be able to test private chaincode with private data that would not be stored in ledger


#This test can be run once following two CRS get merged in master
#1.[FAB-5874] Support for queries over pvtdata
#2.[FAB-5080] Chaincode API Support for PrivateData

@skip
Scenario Outline: FAB-6036-1: Test marbles02_private initMarble, readMarble, deleteMarble, transferMarble, getMarblesByRange, stateTransfer
  Given the FABRIC_LOGGING_SPEC environment variable is gossip.election=DEBUG
  And I have a bootstrapped fabric network of type <type>
  When an admin deploys chaincode at path "github.com/hyperledger/fabric-test/chaincodes/marbles02_private" with args [""] with name "mycc"

  #comment or remove the following 6 lines once we are in phase2
  Given "peer1.org1.example.com" is taken down
  And I wait "10" seconds
  Given "peer1.org2.example.com" is taken down
  And I wait "10" seconds
  Given "peer0.org2.example.com" is taken down
  And I wait "10" seconds

  #These two marbles are used for getMarblesByRange
  When a user invokes on the chaincode named "mycc" with args ["initMarble","001m1","indigo","35","saleem"]
  And I wait "10" seconds
  When a user invokes on the chaincode named "mycc" with args ["initMarble","004m4","green","35","dire straits"]

  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble1","red","35","tom"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble1"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble1"
  And a user receives a response containing "color":"red"
  And a user receives a response containing "size":35
  And a user receives a response containing "owner":"tom"

  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble2","blue","55","jerry"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble2"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble2"
  And a user receives a response containing "color":"blue"
  And a user receives a response containing "size":55
  And a user receives a response containing "owner":"jerry"

  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble111","pink","55","jane"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble111"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble111"
  And a user receives a response containing "color":"pink"
  And a user receives a response containing "size":55
  And a user receives a response containing "owner":"jane"

#Test transferMarble
  When a user invokes on the chaincode named "mycc" with args ["transferMarble","marble1","jerry"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble1"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble1"
  And a user receives a response containing "color":"red"
  And a user receives a response containing "size":35
  And a user receives a response containing "owner":"jerry"

#delete a marble
  When a user invokes on the chaincode named "mycc" with args ["delete","marble2"]
  And I wait "10" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble2"]
  Then a user receives an error response of status:500
  And a user receives an error response of {"Error":"Marble does not exist: marble2"}
  And I wait "3" seconds

# Begin creating marbles to to test transferMarblesBasedOnColor
#  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble100","red","5","cassey"]
#  And I wait "3" seconds

#  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble101","blue","6","cassey"]
#  And I wait "3" seconds

#  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble200","purple","5","ram"]
#  And I wait "3" seconds

#  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble201","blue","6","ram"]
#  And I wait "3" seconds

#  When a user invokes on the chaincode named "mycc" with args ["transferMarblesBasedOnColor","blue","jerry"]
#  And I wait "3" seconds
#  When a user queries on the chaincode named "mycc" with args ["readMarble","marble100"]
#  Then a user receives a response containing "docType":"marble"
#  And a user receives a response containing "name":"marble100"
#  And a user receives a response containing "color":"red"
#  And a user receives a response containing "size":5
#  And a user receives a response containing "owner":"cassey"


#  When a user queries on the chaincode named "mycc" with args ["readMarble","marble101"]
#  Then a user receives a response containing "docType":"marble"
#  And a user receives a response containing "name":"marble101"
#  And a user receives a response containing "color":"blue"
#  And a user receives a response containing "size":6
#  And a user receives a response containing "owner":"jerry"


#  When a user queries on the chaincode named "mycc" with args ["readMarble","marble200"]
#  Then a user receives a response containing "docType":"marble"
#  And a user receives a response containing "name":"marble200"
#  And a user receives a response containing "color":"purple"
#  And a user receives a response containing "size":5
#  And a user receives a response containing "owner":"ram"

#  When a user queries on the chaincode named "mycc" with args ["readMarble","marble201"]
#  Then a user receives a response containing "docType":"marble"
#  And a user receives a response containing "name":"marble201"
#  And a user receives a response containing "color":"blue"
#  And a user receives a response containing "size":6
#  And a user receives a response containing "owner":"jerry"
#

#  When a user invokes on the chaincode named "mycc" with args ["queryMarblesByOwner","ram"]
#  And I wait "3" seconds

#  Then a user receives a response containing "docType":"marble"
#  And a user receives a response containing "name":"marble200"
#  And a user receives a response containing "color":"purple"
#  And a user receives a response containing "size":5
#  And a user receives a response containing "owner":"ram"
#  peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarblesByOwner","tom"]}'
#  peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarbles","{\"selector\":{\"owner\":\"tom\"}}"]}'

# state transfer
  When a user invokes on the chaincode named "mycc" with args ["transferMarble","marble111","jerry"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble111"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble111"
  And a user receives a response containing "color":"pink"
  And a user receives a response containing "size":55
  And a user receives a response containing "owner":"jerry"
  And I wait "10" seconds

  When a user invokes on the chaincode named "mycc" with args ["transferMarble","marble111","tom"]
  And I wait "3" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble111"]
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble111"
  And a user receives a response containing "color":"pink"
  And a user receives a response containing "size":55
  And a user receives a response containing "owner":"tom"

Given the initial non-leader peer of "org1" comes back up
  And I wait "10" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble111"] on the initial non-leader peer of "org1"
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"marble111"
  And a user receives a response containing "color":"pink"
  And a user receives a response containing "size":55
  And a user receives a response containing "owner":"tom"

# Test getMarblesByRange
  When a user queries on the chaincode named "mycc" with args ["getMarblesByRange","001m1", "005m4"]
  And I wait "3" seconds
  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"001m1"
  And a user receives a response containing "color":"indigo"
  And a user receives a response containing "size":35
  And a user receives a response containing "owner":"saleem"

  Then a user receives a response containing "docType":"marble"
  And a user receives a response containing "name":"004m4"
  And a user receives a response containing "color":"green"
  And a user receives a response containing "size":35
  And a user receives a response containing "owner":"dire straits"

  Examples:
   | type  | database |
   | kafka |  leveldb |
   | kafka |  couchdb |
   | solo  |  leveldb |
   | solo  |  couchdb |


@skip
Scenario Outline: FAB-6036-2: Test marbles02_private : getHistoryForMarble
  Given I have a bootstrapped fabric network of type <type>
  When an admin deploys chaincode at path "github.com/hyperledger/fabric-test/chaincodes/marbles02_private" with args [""] with name "mycc"

  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble1","red","35","tom"]
  And I wait "10" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble1"]
  Then a user receives a success response containing "docType":"marble"
  And a user receives a success response containing "name":"marble1"
  And a user receives a success response containing "color":"red"
  And a user receives a success response containing "size":35
  And a user receives a success response containing "owner":"tom"


  When a user invokes on the chaincode named "mycc" with args ["initMarble","marble201","blue","6","ram"]
  And I wait "10" seconds
  # Test getHistoryForMarble
  When a user queries on the chaincode named "mycc" with args ["getHistoryForMarble","marble1"]
  And I wait "10" seconds
  Then a user receives a success response containing "TxId"
  And a user receives a success response containing "Value":{"docType":"marble","name":"marble1","color":"red","size":35,"owner":"tom"}
  And a user receives a success response containing "Timestamp"
  And a user receives a success response containing "IsDelete":"false"

  #delete a marble
  When a user invokes on the chaincode named "mycc" with args ["delete","marble201"]
  And I wait "20" seconds
  When a user queries on the chaincode named "mycc" with args ["readMarble","marble201"]
  Then a user receives a success response of status:500 with error status
  And a user receives a success response of {"Error":"Marble does not exist: marble201"} with error status
  And I wait "10" seconds


  #Test getHistoryForDeletedMarble
  When a user queries on the chaincode named "mycc" with args ["getHistoryForMarble","marble201"]
  And I wait "10" seconds
  Then a user receives a success response containing "TxId"
  And a user receives a success response containing "Value":{"docType":"marble","name":"marble201","color":"blue","size":6,"owner":"ram"}
  And a user receives a success response containing "Timestamp"
  And a user receives a success response containing "IsDelete":"false"
  And I wait "10" seconds
  Then a user receives a success response containing "TxId"
  And a user receives a success response containing "Value":{"docType":"marble","name":"marble201","color":"blue","size":6,"owner":"ram"}
  And a user receives a success response containing "Timestamp"
  And a user receives a success response containing "IsDelete":"true"

  Examples:
    | type  | database |
    | solo  |  leveldb |
    | solo  |  couchdb |
    | kafka |  leveldb |
    | kafka |  couchdb |
