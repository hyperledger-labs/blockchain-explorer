#!/bin/bash

echo "#### Downloaded fabric-test repo"

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
npm install fabric-client@1.4.8
npm install fabric-ca-client@1.4.8
echo "#### Installed required node packages"
popd

rm -f PTE
ln -s $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE ./PTE

pushd specs
echo "#### Starting Ginkgo based test suite"
ginkgo -v
popd