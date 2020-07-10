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

if [ ${NETWORK_MODE} == "single-pem" ]; then
  tmpf=$(mktemp)
  cat specs/crypto-config/peerOrganizations/org1/users/Admin@org1/msp/keystore/priv_sk | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.organizations.org1.adminPrivateKey.pem = "{}"' configs/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" configs/connection-profile/org1-network-pem.json

  cat specs/crypto-config/peerOrganizations/org1/users/Admin@org1/msp/signcerts/Admin@org1-cert.pem | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.organizations.org1.signedCert.pem = "{}"' configs/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" configs/connection-profile/org1-network-pem.json

  cat specs/crypto-config/peerOrganizations/org1/peers/peer0-org1.org1/tls/ca.crt | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.peers."peer0-org1".tlsCACerts.pem = "{}"' configs/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" configs/connection-profile/org1-network-pem.json

  jq '.client.adminCredential.id = "exploreradmin2"' configs/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" configs/connection-profile/org1-network-pem.json
fi
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

# export LOG_LEVEL_CONSOLE=debug
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