# SPDX-License-Identifier: Apache-2.0

Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

@doNotDecompose
Scenario: Bring up fabric network for GUI e2e test
    Given For explorer env, I have a bootstrapped fabric network of type kafka-sd
    Given the NETWORK_PROFILE environment variable is solo-tls-disabled

    When an admin sets up a channel named "mychannel"
    Given Update "peer0.org1.example.com" of "Org1ExampleCom" as an anchor in "mychannel"
    Given Update "peer0.org2.example.com" of "Org2ExampleCom" as an anchor in "mychannel"

    When an admin deploys chaincode at path "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd" with args ["init","a","1000","b","2000"] with name "mycc" on channel "mychannel"
    When a user invokes on the channel "mychannel" using chaincode named "mycc" with args ["invoke","a","b","10"]
    When I wait "3" seconds
    When a user queries on the channel "mychannel" using chaincode named "mycc" with args ["query","a"]
    Then a user receives a success response of 990

    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Please open web browser to access ：" within 20 seconds
