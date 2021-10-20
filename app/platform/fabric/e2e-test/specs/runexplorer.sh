#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ROOTPATH="$( cd "$(dirname "$0")/../../../../.." >/dev/null 2>&1 ; pwd -P )"
CLEANUP=1

while getopts "km:" opt; do
  case "$opt" in
  k)
    echo "keep DB data and wallet"
    CLEANUP=0
    ;;
  m)
    NETWORK_MODE=$OPTARG
    export NETWORK_MODE=$NETWORK_MODE
    echo "Network mode : ${NETWORK_MODE}"
    ;;
  esac
done

echo $SCRIPTPATH
echo $ROOTPATH
TIMEOUT=30
DELAY=10

pushd ${SCRIPTPATH}/..

# cp ./configs/config_${NETWORK_MODE}.json ${ROOTPATH}/app/platform/fabric/config.json

if [ ${NETWORK_MODE} == "single-pem" ]; then
  tmpf=$(mktemp)
  cat ${ROOTPATH}/test/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.organizations.org1.adminPrivateKey.pem = "{}"' ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json

  cat ${ROOTPATH}/test/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/cert.pem | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.organizations.org1.signedCert.pem = "{}"' ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json

  cat ${ROOTPATH}/test/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt | \
  awk '{printf "%s\\n",$0} END {print ""}' | \
  xargs -0 -I{} jq '.peers."peer0.org1.example.com".tlsCACerts.pem = "{}"' ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json

  jq '.client.adminCredential.id = "exploreradmin2"' ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json \
  > "$tmpf"
  mv -f "$tmpf" ${ROOTPATH}/test/api/connection-profile/org1-network-pem.json
fi
popd


pushd ${ROOTPATH}

if [ $CLEANUP -eq 1 ]; then
  # ./build_docker_image.sh
  docker-compose down -v
  docker-compose up -d explorerdb.mynetwork.com
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

  # rm -rf logs wallet
fi

# export LOG_LEVEL_CONSOLE=debug
export EXPLORER_CONFIG_FILE_PATH=${ROOTPATH}/test/api/config_${NETWORK_MODE}.json
export EXPLORER_PROFILE_DIR_PATH=${ROOTPATH}/test/api/connection-profile
export FABRIC_CRYPTO_PATH=${ROOTPATH}/test/fabric-samples/test-network/organizations
export EXPLORER_SYNC_BLOCKSYNCTIME_SEC=5

pushd ${ROOTPATH}
docker-compose up -d
popd

echo "#### Starting Explorer process ..."

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs explorer.mynetwork.com 2>&1 | grep -q "Please open web browser to access"
  rc=$?
  set +x
done
echo "#### Started Explorer process"
popd