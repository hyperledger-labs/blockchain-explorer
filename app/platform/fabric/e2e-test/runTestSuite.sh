#!/bin/bash

ROOTDIR="$(cd "$(dirname "$0")"/../../../.. && pwd)"
FABRIC_V1_VERSION=1.4.8
FABRIC_CA_V1_VERSION=1.4.7
FABRIC_V2_VERSION=2.2.0
FABRIC_CA_V2_VERSION=1.4.7

echo "#### Downloaded fabric-test repo"

if [ $# -eq 0 ]; then
  echo "$0 [-1 | -2]"
  exit 1;
fi

while getopts "12" opt; do
  case "$opt" in
  1)
    SDKVER=1.4.11
    export FABRIC_VERSION=1
    export RELEASE_VERSION=1.4-stable
    CHECKOUT_HASH=45799a2ee4eefa49ae705cc57ed415270c35d60a
    # export FABRIC_CFG_PATH=$GOPATH/src/github.com/hyperledger/fabric-test/scripts/config
    export PATH=$GOPATH/src/github.com/hyperledger/fabric-test/scripts/bin:$PATH
    PULL_PEER_IMAGE_VERSION=${FABRIC_V1_VERSION}
    PULL_CA_IMAGE_VERSION=${FABRIC_CA_V1_VERSION}
    ;;
  2)
    SDKVER=2.0.0-beta.2
    export FABRIC_VERSION=2
    CHECKOUT_HASH=09680bea5aa0ec464982f7979fd99a777e8c1fed
    export FABRIC_CFG_PATH=$GOPATH/src/github.com/hyperledger/fabric-test/config
    export PATH=$GOPATH/src/github.com/hyperledger/fabric-test/bin:$PATH
    PULL_PEER_IMAGE_VERSION=${FABRIC_V2_VERSION}
    PULL_CA_IMAGE_VERSION=${FABRIC_CA_V2_VERSION}
    ;;
  *)
    echo "$0 [-1 | -2]"
    exit 1;
    ;;
  esac
done

echo "HASH: ${CHECKOUT_HASH}"
echo "SDK : ${SDKVER}"
echo "ROOT: ${ROOTDIR}"

set -e

mkdir -p $GOPATH/src/github.com/hyperledger

pushd $GOPATH/src/github.com/hyperledger
sudo rm -rf fabric-test
if [ ! -d fabric-test ]; then
  git clone https://github.com/hyperledger/fabric-test.git
fi
cd fabric-test
# git checkout 45799a2ee4eefa49ae705cc57ed415270c35d60a
git checkout ${CHECKOUT_HASH}
make pull-binaries-fabric
echo "#### Updated each sub-module under fabric-test repo"
popd

pushd $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE
npm install fabric-client@${SDKVER}
npm install fabric-ca-client@${SDKVER}
echo "#### Installed required node packages"
popd

pushd $ROOTDIR/app/platform/fabric/e2e-test
rm -f PTE
ln -s $GOPATH/src/github.com/hyperledger/fabric-test/tools/PTE ./PTE
popd

pushd $ROOTDIR
rm -rf wallet logs
popd

curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- ${PULL_PEER_IMAGE_VERSION} ${PULL_CA_IMAGE_VERSION} 0.4.18 -s -b
docker tag hyperledger/fabric-ca:${PULL_CA_IMAGE_VERSION} hyperledger/fabric-ca:${PULL_PEER_IMAGE_VERSION}

pushd $ROOTDIR/app/platform/fabric/e2e-test/specs

rm -rf templates
sed -i -e '/github.com\/hyperledger\/fabric-test/d' go.mod
if [ ${FABRIC_VERSION} -eq 2 ]; then
  cp -a templates-v2 templates
  go get github.com/hyperledger/fabric-test@${CHECKOUT_HASH}
  go get github.com/hyperledger/fabric-test/tools/operator@${CHECKOUT_HASH}
  go get github.com/hyperledger/fabric-test/chaincodes/samplecc/go@${CHECKOUT_HASH}
else
  cp -a templates-v1 templates
  go get github.com/hyperledger/fabric-test@${CHECKOUT_HASH}
fi

echo "#### Starting Ginkgo based test suite"
ginkgo -v -stream -failFast
popd