#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MODE=$1

pushd ${SCRIPTPATH}/..

echo ${MODE}
cp configs/config_${MODE}.json configs/config.json
docker-compose down -v
docker-compose up -d explorerdb.mynetwork.com explorer.mynetwork.com
sleep 20

popd