#!/bin/bash

go get -d github.com/hyperledger/fabric-test
pushd $GOPATH/src/github.com/hyperledger/fabric-test
git submodule foreach git checkout release-1.4
pushd tools/PTE
npm install fabric-client@1.4.5
npm install fabric-ca-client@1.4.5
popd
popd
rm -f PTE
ln -s $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE ./PTE
pushd specs
ginkgo -v
popd