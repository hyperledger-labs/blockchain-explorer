#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#


ROOTDIR="$(cd "$(dirname "$0")"/../.. && pwd)"

TIMEOUT=600
DELAY=10

set -e

mkdir -p $GOPATH/src/github.com/hyperledger

pushd $GOPATH/src/github.com/hyperledger
if [ ! -d fabric-test ]; then
  git clone https://github.com/hyperledger/fabric-test.git -b release-1.4
fi
cd fabric-test
git checkout 45799a2ee4eefa49ae705cc57ed415270c35d60a
echo "#### Updated each sub-module under fabric-test repo"
popd

pushd $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE
rm -rf node_modules package-lock.json
npm install fabric-client@1.4.8
npm install fabric-ca-client@1.4.8
echo "#### Installed required node packages"
popd

#
# Start selenium standalone server
#
pushd $ROOTDIR/client/e2e-test
docker-compose down -v
docker-compose -f docker-compose-explorer.yaml down -v
docker-compose up -d
docker-compose -f docker-compose-explorer.yaml up -d explorerdb.mynetwork.com
echo "#### Starting selenium containers & explorer-db container ..."

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x +e
  docker logs explorerdb.mynetwork.com 2>/dev/null | grep -q "database system is ready to accept connections"
  rc=$?
  set +x -e
done
echo "#### Started explorer-db container"
popd

pushd $ROOTDIR/client
echo "#### Starting WebDriverI/O based test suite"
npx wdio ./e2e-test/wdio.conf.js
popd