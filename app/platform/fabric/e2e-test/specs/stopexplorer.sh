#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ROOTPATH="$( cd "$(dirname "$0")/../../../../.." >/dev/null 2>&1 ; pwd -P )"
CLEANUP=1

while getopts "k" opt; do
  case "$opt" in
  k)
    echo "keep DB data and wallet"
    CLEANUP=0
    ;;
  esac
done

pushd ${ROOTPATH}

./stop.sh
if [ $CLEANUP -eq 1 ]; then
  docker-compose -f ./app/platform/fabric/e2e-test/docker-compose.yaml down -v
  rm -rf wallet/ logs/
fi

popd