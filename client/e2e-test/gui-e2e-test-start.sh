#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#


ROOTDIR="$(cd "$(dirname "$0")"/../.. && pwd)"

TIMEOUT=600
DELAY=10

go get -d github.com/hyperledger/fabric-test 

echo "#### Downloaded fabric-test repo"

# An error that we can ignore is raised when getting fabric-test package
# So we need to enable the error abort option after getting fabric-test pkg
set -e

pushd $GOPATH/src/github.com/hyperledger/fabric-test
git checkout release-1.4
git submodule update --init --recursive
git submodule foreach git checkout release-1.4
echo "#### Updated each sub-module under fabric-test repo"
popd

pushd $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE
npm install fabric-client@1.4.5
npm install fabric-ca-client@1.4.5
echo "#### Installed required node packages"
popd

#
# Start selenium standalone server
#
pushd $ROOTDIR/client/e2e-test
export NETWORK_ID=configfiles_default
network_check=$(docker network ls --filter name=${NETWORK_ID} -q | wc -l)
if [ $network_check -eq 0 ]; then
  docker network create configfiles_default
fi
echo "#### Created network : ${NETWORK_ID}"

docker-compose down -v
docker-compose -f docker-compose-explorer.yaml down -v
docker-compose up -d
echo "#### Starting selenium containers ..."

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
echo "#### Started selenium containers"
popd

pushd $ROOTDIR/client
echo "#### Starting WebDriverI/O based test suite"
npx wdio ./e2e-test/wdio.conf.js
popd