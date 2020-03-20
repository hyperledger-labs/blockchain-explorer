#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
export NETWORK_MODE=$1

TIMEOUT=600
DELAY=10

pushd ${SCRIPTPATH}/..

docker-compose down -v
docker-compose up -d explorerdb.mynetwork.com explorer.mynetwork.com
echo "#### Starting explorer ..."


rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs explorer.mynetwork.com | grep -q "Please open web browser to access"
  rc=$?
  set +x
done
echo "#### Started explorer"

popd