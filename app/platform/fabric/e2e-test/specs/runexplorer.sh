#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
export NETWORK_MODE=$1

pushd ${SCRIPTPATH}/..

docker-compose down -v
docker-compose up -d explorerdb.mynetwork.com explorer.mynetwork.com
sleep 20

popd