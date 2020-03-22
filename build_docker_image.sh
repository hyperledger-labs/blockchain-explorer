#!/bin/bash

#SPDX-License-Identifier: Apache-2.0

FABRIC_EXPLORER_DB_TAG="hyperledger/explorer-db"
FABRIC_EXPLORER_TAG="hyperledger/explorer"

function banner(){
	echo ""
	echo "  _    _                       _          _                   ______            _                     "
	echo " | |  | |                     | |        | |                 |  ____|          | |                    "
	echo " | |__| |_   _ _ __   ___ _ __| | ___  __| | __ _  ___ _ __  | |__  __  ___ __ | | ___  _ __ ___ _ __ "
	echo " |  __  | | | | '_ \ / _ \ '__| |/ _ \/ _\` |/ _\` |/ _ \ '__| |  __| \ \/ / '_ \| |/ _ \| '__/ _ \ '__|"
	echo " | |  | | |_| | |_) |  __/ |  | |  __/ (_| | (_| |  __/ |    | |____ >  <| |_) | | (_) | | |  __/ |   "
	echo " |_|  |_|\__, | .__/ \___|_|  |_|\___|\__,_|\__, |\___|_|    |______/_/\_\ .__/|_|\___/|_|  \___|_|   "
	echo "          __/ | |                            __/ |                       | |                          "
	echo "         |___/|_|                           |___/                        |_|                          "
	echo ""
}

function deploy_build_database(){
	echo "Building Hyperledger Fabric Database image..."
	docker build --build-arg "http_proxy=${http_proxy}" --build-arg "https_proxy=${https_proxy}" --build-arg "no_proxy=${no_proxy}" -f postgres-Dockerfile --tag $FABRIC_EXPLORER_DB_TAG .
}

function deploy_build_explorer(){
	echo "Building Hyperledger Fabric explorer image..."
	docker build --build-arg "http_proxy=${http_proxy}" --build-arg "https_proxy=${https_proxy}" --build-arg "no_proxy=${no_proxy}" --tag $FABRIC_EXPLORER_TAG .
}

banner

build_db=0
build_explorer=0
build_all=1

while getopts "de" opt; do
  case "$opt" in
  d)
    echo "Build DB images"
    build_db=1
		build_all=0
    ;;
  e)
    echo "Build Explorer images"
    build_explorer=1
		build_all=0
    ;;
  esac
done

if [ $build_all -eq 1 ]; then
	deploy_build_explorer
	deploy_build_database
else
	if [ $build_db -eq 1 ]; then
		deploy_build_database
	fi

	if [ $build_explorer -eq 1 ]; then
		deploy_build_explorer
	fi
fi