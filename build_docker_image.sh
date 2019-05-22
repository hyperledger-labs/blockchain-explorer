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
	docker build -f postgres-Dockerfile --tag $FABRIC_EXPLORER_DB_TAG .
}

function deploy_build_explorer(){
	echo "Building Hyperledger Fabric explorer image..."
	docker build --tag $FABRIC_EXPLORER_TAG .
}

banner

deploy_build_explorer
deploy_build_database