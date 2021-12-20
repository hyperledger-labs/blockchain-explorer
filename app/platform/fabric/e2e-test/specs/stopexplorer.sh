#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

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

if [ $CLEANUP -eq 1 ]; then
  docker-compose down -v
else
  docker-compose down
fi

popd