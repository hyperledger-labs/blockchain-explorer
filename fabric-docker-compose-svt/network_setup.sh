#!/bin/bash

function usage () {
	echo
	echo "======================================================================================================"
	echo "Usage: "
	echo "      network_setup.sh -n [channel-name] -s -c -t [cli timer] -f [compose yaml] <up|down|retstart>"
	echo
	echo "      ./network_setup.sh -n "mychannel" -c -s -t 10  restart"
	echo
	echo "		-n       channel name"
	echo "		-c       enable couchdb"
	echo "		-f       Docker compose file for the network"
	echo "		-s       Enable TLS"
	echo "		-t       CLI container timeout"
	echo "		up       Launch the network and start the test"
	echo "		down     teardown the network and the test"
	echo "		restart  Restart the network and start the test"
	echo "======================================================================================================"
	echo
}

##process all the options
while getopts "scn:f:t:h" opt; do
  case "${opt}" in
    n)
      CH_NAME="$OPTARG"
      ;;
    c)
      COUCHDB="y" ## enable couchdb
      ;;
    t)
      CLI_TIMEOUT=$OPTARG ## CLI container timeout
      ;;
    s)
      SECURITY="y" #Enable TLS
      ;;
    h)
      usage
      exit 1
      ;;
    f)
      COMPOSE_FILE="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      exit 1
      ;;
  esac
done

## this is to read the argument up/down/restart
shift $((OPTIND-1))
UP_DOWN="$@"

##Set Defaults
: ${CH_NAME:="mychannel"}
: ${SECURITY:="n"}
: ${COMPOSE_FILE:="docker-compose-cli.yaml"}
: ${UP_DOWN:="restart"}
: ${CLI_TIMEOUT:="2"} ## Increase timeout for debugging purposes
: ${COUCHDB:="n"}

function clearContainers () {
        CONTAINER_IDS=$(docker ps -aq)
        if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" = " " ]; then
                echo "---- No containers available for deletion ----"
        else
                docker rm -f $CONTAINER_IDS
        fi
}

function removeUnwantedImages() {
        DOCKER_IMAGE_IDS=$(docker images | grep "dev\|none\|test-vp\|peer[0-9]-" | awk '{print $3}')
        if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" = " " ]; then
                echo "---- No images available for deletion ----"
        else
                docker rmi -f $DOCKER_IMAGE_IDS
        fi
}

function networkUp () {
    #Generate all the artifacts that includes org certs, orderer genesis block,
    # channel configuration transaction
    source generateArtifacts.sh $CH_NAME

    if [ "$SECURITY" == "y" -o "$SECURITY" == "Y" ]; then
        SECURITY=true
    else
        SECURITY=false
    fi
    if [ "$COUCHDB" == "y" -o "$COUCHDB" == "Y" ]; then
       ENABLE_TLS=$SECURITY CHANNEL_NAME=$CH_NAME TIMEOUT=$CLI_TIMEOUT docker-compose -f $COMPOSE_FILE -f docker-compose-couch.yaml up -d 2>&1
    else
       ENABLE_TLS=$SECURITY CHANNEL_NAME=$CH_NAME TIMEOUT=$CLI_TIMEOUT docker-compose -f $COMPOSE_FILE up -d 2>&1
    fi

    if [ $? -ne 0 ]; then
	    echo "ERROR !!!! Unable to pull the images "
	    exit 1
    fi
    docker logs -f cli | tee cli_logs.txt
}

function networkDown () {
    docker-compose -f $COMPOSE_FILE down

    #Cleanup the chaincode containers
    clearContainers

    #Cleanup images
    removeUnwantedImages

    # remove orderer block and other channel configuration transactions and certs
    rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config cli_logs.txt
}

#Create the network using docker compose
if [ "${UP_DOWN}" == "up" ]; then
	networkUp
elif [ "${UP_DOWN}" == "down" ]; then ## Clear the network
	networkDown
elif [ "${UP_DOWN}" == "restart" ]; then ## Restart the network
	networkDown
	networkUp
else
	usage
	exit 1
fi
