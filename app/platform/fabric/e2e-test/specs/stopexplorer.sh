#!/bin/bash

# SPDX-License-Identifier: Apache-2.0

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ROOTPATH="$( cd "$(dirname "$0")/../../../../.." >/dev/null 2>&1 ; pwd -P )"

pushd ${ROOTPATH}

./stop.sh
docker-compose -f ./app/platform/fabric/e2e-test/docker-compose.yaml down -v

popd