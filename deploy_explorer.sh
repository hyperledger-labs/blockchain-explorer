#!/bin/bash

# Copyright Tecnalia Research & Innovation (https://www.tecnalia.com)
# Copyright Tecnalia Blockchain LAB
#
# SPDX-License-Identifier: Apache-2.0

#BASH CONFIGURATION
# Enable colored log
export TERM=xterm-256color

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

# HELPER FUNCTIONS
# Check whether a given container (filtered by name) exists or not
function existsContainer(){
	containerName=$1
	if [ -n "$(docker ps -aq -f name=$containerName)" ]; then
	    return 0 #true
	else
		return 1 #false
	fi
}

# HELPER FUNCTIONS
# Check whether a given network (filtered by name) exists or not
function existsNetwork(){
	networkName=$1
	if [ -n "$(docker network ls -q -f name=$networkName)" ]; then
	    return 0 #true
	else
		return 1 #false
	fi
}

# Check whether a given network (filtered by name) exists or not
function existsImage(){
	imageName=$1
	if [ -n "$(docker images -a -q $imageName)" ]; then
	    return 0 #true
	else
		return 1 #false
	fi
}

# Configure settings of HYPERLEDGER EXPLORER
function config(){
	# BEGIN: GLOBAL VARIABLES OF THE SCRIPT
	defaultFabricName="net1"
	if [ -z "$1" ]; then
		echo "No custom Hyperledger Network configuration supplied. Using default network name: $defaultFabricName"
		fabricBlockchainNetworkName=$defaultFabricName
	else
		fabricBlockchainNetworkName=$1
		echo "Using custom Hyperledger Network configuration. Network name: $fabricBlockchainNetworkName"
	fi
	docker_network_name="fabric-explorer-net"
	# Default Hyperledger Explorer Database Credentials.
	explorer_db_user="hppoc"
	explorer_db_pwd="password"
	#configure explorer to connect to specific Blockchain network using given configuration
	network_config_file=$(pwd)/examples/$fabricBlockchainNetworkName/config.json
	#configure explorer to connect to specific Blockchain network using given crypto materials
	network_crypto_base_path=$(pwd)/examples/$fabricBlockchainNetworkName/crypto

	# local vnet configuration

	# Docker network configuration
	# Address:   192.168.10.0         11000000.10101000.00001010. 00000000
	# Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
	# Wildcard:  0.0.0.255            00000000.00000000.00000000. 11111111
	# =>
	# Network:   192.168.10.0/24      11000000.10101000.00001010. 00000000
	# HostMin:   192.168.10.1         11000000.10101000.00001010. 00000001
	# HostMax:   192.168.10.254       11000000.10101000.00001010. 11111110
	# Broadcast: 192.168.10.255       11000000.10101000.00001010. 11111111
	# Hosts/Net: 254                   Class C, Private Internet
	subnet=192.168.10.0/24

	# database container configuration
	fabric_explorer_db_tag="hyperledger-blockchain-explorer-db"
	fabric_explorer_db_name="blockchain-explorer-db"
	db_ip=192.168.10.11

	# fabric explorer configuratio
	fabric_explorer_tag="hyperledger-blockchain-explorer"
	fabric_explorer_name="blockchain-explorer"
	explorer_ip=192.168.10.12
	# END: GLOBAL VARIABLES OF THE SCRIPT
}

function deploy_prepare_network(){
	if existsNetwork $docker_network_name; then
		echo "Removing old configured docker vnet for Hyperledger Explorer"
		# to avoid active endpoints
		stop_database
		stop_explorer
		docker network rm $docker_network_name
	fi

	echo "Creating default Docker vnet for Hyperledger Fabric Explorer"
	docker network create --subnet=$subnet $docker_network_name
}

function deploy_build_database(){
	echo "Building Hyperledger Fabric Database image from current local version..."
	docker build -f postgres-Dockerfile --tag $fabric_explorer_db_tag .
}

function stop_database(){
	if existsContainer $fabric_explorer_db_name; then
		echo "Stopping previously deployed Hyperledger Fabric Explorer DATABASE instance..."
		docker stop $fabric_explorer_db_name && \
		docker rm $fabric_explorer_db_name
	fi
}

function deploy_run_database(){
	stop_database

	# deploy database with given user/password configuration
	# By default, since docker is used, there are no users created so default available user is
	# postgres/password
	echo "Deploying Database (POSTGRES) container at $db_ip"
	docker run \
		-d \
		--name $fabric_explorer_db_name \
		--net $docker_network_name --ip $db_ip \
		-e POSTGRES_PASSWORD=$explorer_db_pwd \
		-e PGPASSWORD=$explorer_db_pwd \
		$fabric_explorer_db_tag
}

function deploy_load_database(){
	echo "Preparing database for Explorer"
	echo "Waiting...6s"
	sleep 1s
	echo "Waiting...5s"
	sleep 1s
	echo "Waiting...4s"
	sleep 1s
	echo "Waiting...3s"
	sleep 1s
	echo "Waiting...2s"
	sleep 1s
	echo "Waiting...1s"
	sleep 1s
	echo "Creating Default user..."
	docker exec $fabric_explorer_db_name psql -h localhost -U postgres -c "CREATE USER $explorer_db_user WITH PASSWORD '$explorer_db_pwd'"
	echo "Creating default database schemas..."
	docker exec $fabric_explorer_db_name psql -h localhost -U postgres -a -f /opt/explorerpg.sql
	docker exec $fabric_explorer_db_name psql -h localhost -U postgres -a -f /opt/updatepg.sql
}

function deploy_build_explorer(){
	echo "Building Hyperledger Fabric explorer image from current local version..."
	docker build --tag $fabric_explorer_tag .
	echo "Hyperledger Fabric network configuration file is located at $network_config_file"
	echo "Hyperledger Fabric network crypto material at $network_crypto_base_path"
}

function stop_explorer(){
	if existsContainer $fabric_explorer_name; then
		echo "Stopping previously deployed Hyperledger Fabric Explorer instance..."
		docker stop $fabric_explorer_name && \
		docker rm $fabric_explorer_name
	fi
}

function deploy_run_explorer(){
	stop_explorer

	echo "Deploying Hyperledger Fabric Explorer container at $explorer_ip"
	docker run \
		-d \
		--name $fabric_explorer_name \
		--net $docker_network_name --ip $explorer_ip \
		-e DATABASE_HOST=$db_ip \
		-e DATABASE_USERNAME=$explorer_db_user \
		-e DATABASE_PASSWD=$explorer_db_pwd \
		-v $network_config_file:/opt/explorer/app/platform/fabric/config.json \
		-v $network_crypto_base_path:/tmp/crypto \
		-p 8080:8080 \
		hyperledger-blockchain-explorer
}

function deploy(){

	deploy_prepare_network
	echo "Starting explorer in local mode..."
	if !(existsImage $fabric_explorer_db_tag); then
		deploy_build_database
	fi
	deploy_run_database
	deploy_load_database

	if !(existsImage $fabric_explorer_tag); then
		deploy_build_explorer
	fi
	deploy_run_explorer
}

function main(){
	banner
	#Pass arguments to function exactly as-is
	config "$@"
	deploy
}

#Pass arguments to function exactly as-is
main "$@"