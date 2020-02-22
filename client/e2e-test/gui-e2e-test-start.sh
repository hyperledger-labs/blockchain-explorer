#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#


ROOTDIR="$(cd "$(dirname "$0")"/../.. && pwd)"

TIMEOUT=600
DELAY=10

#
# Start selenium standalone server
#
pushd $ROOTDIR/client/e2e-test

export NETWORK_ID=configfiles_default
docker network inspect configfiles_default >/dev/null 2>&1
if [ $? -eq 1 ]; then
  docker network create configfiles_default
fi

docker-compose down -v
docker-compose -f docker-compose-explorer.yaml down -v
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

pushd $ROOTDIR/client

npx wdio ./e2e-test/wdio.conf.js

popd