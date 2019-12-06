#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#


ROOTDIR="$(cd "$(dirname "$0")"/../.. && pwd)"
# export CORE_PEER_NETWORKID=e2egui
# export COMPOSE_PROJECT_NAME=$CORE_PEER_NETWORKID
# export NETWORK_PROFILE=first-network

# docker rm -f $(docker ps -aq)
# docker volume rm -f $(docker volume ls -q)

TIMEOUT=600
DELAY=10

# #
# # Setup fabric-samples/first-network
# #
# pushd $ROOTDIR/app/platform/fabric/e2e-test/fabric-samples/first-network

# rm -rf ../../configs/$CORE_PEER_NETWORKID
# rm -rf channel-artifacts/* ordererOrganizations peerOrganizations

# mkdir -p ../../configs/$CORE_PEER_NETWORKID
# ./byfn.sh generate -c mychannel

# cp -a channel-artifacts crypto-config/* ../../configs/$CORE_PEER_NETWORKID

# docker-compose -f docker-compose-explorer.yaml down -v
# docker-compose -f docker-compose-explorer.yaml up -d
# docker exec -d cli scripts/script.sh

# # continue to poll
# # we either get a matched keyword, or reach TIMEOUT
# rc=1
# starttime=$(date +%s)
# while
#   [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
# do
#   sleep $DELAY
#   set -x
#   if [ $(docker ps -q --filter name='dev-peer1.org2' | wc -l) -eq 1 ]; then
#     rc=0
#   fi
#   set +x
# done

# popd

# #
# # Bring up Explorer
# #
# pushd $ROOTDIR/app/platform/fabric/e2e-test/docker-compose
# docker-compose -f docker-compose-explorer.yaml down -v
# docker-compose -f docker-compose-explorer.yaml up -d

# rc=1
# starttime=$(date +%s)
# while
#   [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
# do
#   sleep $DELAY
#   set -x
#   docker logs explorer.mynetwork.com | grep -q "Please open web browser to access"
#   rc=$?
#   set +x
# done

# popd

#
# Start selenium standalone server
#
pushd $ROOTDIR/client/test
sudo apt-get install jq
export NETWORK_ID=$(docker inspect peer0.org1.example.com | jq '.[].NetworkSettings.Networks' | jq -rc 'keys' | jq -r '.[0]')
docker-compose down
docker-compose up -d

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs selenium-chrome | grep -q "The node is registered to the hub and ready to use"
  rc=$?
  set +x
done

popd
