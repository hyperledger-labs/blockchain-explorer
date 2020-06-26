#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ROOTPATH="$( cd "$(dirname "$0")/../../../../.." >/dev/null 2>&1 ; pwd -P )"
export NETWORK_MODE=$1

pushd ${ROOTPATH}
# At first, need to clean up logs as test app is monitoring logs/console to detect completion of explorer setup
rm -rf logs wallet
popd


echo $SCRIPTPATH
echo $ROOTPATH
TIMEOUT=30
DELAY=10

pushd ${SCRIPTPATH}/..

cp ./configs/config_${NETWORK_MODE}.json ${ROOTPATH}/app/platform/fabric/config.json

popd


pushd ${ROOTPATH}

./build_docker_image.sh -d
docker-compose -f ./app/platform/fabric/e2e-test/docker-compose.yaml down -v
docker-compose -f ./app/platform/fabric/e2e-test/docker-compose.yaml up -d explorerdb.mynetwork.com
echo "#### Starting DB container ..."

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs explorerdb.mynetwork.com 2>/dev/null | grep -q "database system is ready to accept connections"
  rc=$?
  set +x
done
echo "#### Started DB container"

rm -rf logs wallet

export LOG_LEVEL_CONSOLE=debug
export EXPLORER_SYNC_BLOCKSYNCTIME_SEC=5
./start.sh
echo "#### Starting Explorer process ..."

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  cat logs/console/console.log 2>/dev/null | grep -q "Please open web browser to access"
  rc=$?
  set +x
done
echo "#### Started Explorer process"
popd