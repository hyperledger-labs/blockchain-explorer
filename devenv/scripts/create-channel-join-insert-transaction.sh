#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#
#  BE-374 :  Write a script for creating new channels with data
#
# This script will reating a new channel and getting peer to join channel,
# instantiating existing chaincode on that channel ( or installing and instantiating if a new chaincode)
# and invoking chaincode to submit transactions to generate some data. This will make it easier for developers
# to test explorer with multiple   channels Fabric network.

set -e
#set the fabric first-network workspace depends on network setup
export FABRIC_CFG_PATH=/home/fabric-samples/first-network
export PATH=$PATH:$FABRIC_CFG_PATH/../bin:$GOPATH/bin
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ID=cli
export CORE_LOGGING_LEVEL=INFO
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
export MSYS_NO_PATHCONV=1
# channel name defaults to "mychannel" if no input is provided
CHANNEL_NAME=mychannel
NUMBER_OF_TRANSACTIONS=10

# change working directory to fabric-samples/first-network
CWD=$FABRIC_CFG_PATH
cd $CWD
# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  create-channel-join-insert-transaction.sh [-c <channel name>] [-n <Number of Transactions>]"
  echo "  create-channel-join-insert-transaction.sh -h|--help (print this message)"
  echo "    -c <channel name> - channel name to use (defaults to \"mychannel\")"
  echo "    -n <Number of Transactions> - Number of Transactions (defaults to 10)"
}


# Parse commandline args
while getopts "h?c:n:" opt; do
  case "$opt" in
    h|\?)
      printHelp
      exit 0
    ;;
    c)  CHANNEL_NAME=$OPTARG
    ;;
    n)  NUMBER_OF_TRANSACTIONS=$OPTARG
    ;;
  esac
done

echo " Command Line Arguments Channel Name : $CHANNEL_NAME and NUMBER_OF_TRANSACTIONS : $NUMBER_OF_TRANSACTIONS "

which docker >& /dev/null
NODOCKER=$?
if [ "${NODOCKER}" == 0 ]; then
	  echo "Checking for  fabric Images"
        if [[ "$(docker images -q fabric-peer:latest 2> /dev/null)" == "" ]]; then
	  echo "hyperledger docker images exists..continue executing script"
	else
	    echo "========================================================="
	    echo "Hyperledger fabric is not installed, exit the script"
	    echo "========================================================="
	    exit 1
        fi
 else
    echo "========================================================="
    echo "Docker not installed, exit the script"
    echo "========================================================="
    exit 1
fi
which configtxgen
if [ "$?" -ne 0 ]; then
echo "configtxgen tool not found. exiting"
exit 1
fi
#if [ -f ./channel-artifacts/$CHANNEL_NAME.tx ]
if sudo docker exec -it cli peer channel list | grep -w $CHANNEL_NAME > /dev/null;
then
    echo "hyperledger fabric new channel - $CHANNEL_NAME alreay exists. continuing creating transactions for given channel"
  else

##########################################################################################################
echo "creating hyperledger fabric new channel - $CHANNEL_NAME"

#########################################################################################################

configtxgen -channelID $CHANNEL_NAME -outputCreateChannelTx ./channel-artifacts/$CHANNEL_NAME.tx -profile TwoOrgsChannel

configtxgen -outputBlock ./channel-artifacts/$CHANNEL_NAME -profile=TwoOrgsOrdererGenesis

sudo docker exec -it  -e "CORE_LOGGING_LEVEL=INFO" -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH" -e "CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS"  cli peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts\
/$CHANNEL_NAME.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers\
/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

sudo docker exec -it cli peer channel join -b $CHANNEL_NAME.block

sudo docker exec -e "CORE_LOGGING_LEVEL=INFO" -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH" -e "CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS" cli peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src\
/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com\
-cert.pem -C $CHANNEL_NAME -n mycc -l golang -v 1.0 -c '{"Args":["init","a","100","b","200"]}'

sleep 30

fi


##########################################################################################################

echo  "Creating N number of Transactions on channel for a given $NUMBER_OF_TRANSACTIONS"

#########################################################################################################

n=0

while [ $n -lt $NUMBER_OF_TRANSACTIONS ]
do
sudo docker exec -e "CORE_LOGGING_LEVEL=INFO" -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH" -e "CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS" cli peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile /opt\
/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts\
/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","3000"]}'
n=`expr $n + 1`
done
exit 0

