#!/bin/bash

ROOTDIR="$(cd "$(dirname "$0")"/../../../.. && pwd)"

mkdir $ROOTDIR/test 2>/dev/null

pushd $ROOTDIR/test

curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.3.3 1.5.2
# curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.1.1 1.4.7 0.4.20
# curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.4 1.5.2

popd

pushd $ROOTDIR/test/fabric-samples/test-network

git checkout a97e8d1267fafb013aadae6850312c1b07a1ecd8
docker rm -f $(docker ps -qa) 2>/dev/null
docker volume rm $(docker volume ls -q) 2>/dev/null
./network.sh down

set -e

./network.sh up createChannel -ca -c org1channel
./network.sh createChannel -ca -c commonchannel
find organizations/peerOrganizations/ -type f -name "*_sk" | xargs dirname | xargs -I{} bash -c "pushd {} && ln -s *_sk priv_sk && popd"
./network.sh deployCC -c org1channel -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go

export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C org1channel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

sleep 3

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C org1channel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'

popd

pushd $ROOTDIR/app/platform/fabric/e2e-test/specs

echo "#### Starting Ginkgo based test suite"
ginkgo -v -stream -failFast

popd