#!/bin/bash

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

rm -f PTE
ln -s $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE ./PTE

pushd specs
echo "#### Starting Ginkgo based test suite"
ginkgo -v
popd