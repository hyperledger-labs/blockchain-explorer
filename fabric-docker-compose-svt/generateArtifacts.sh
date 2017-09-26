#!/bin/bash +x

#set -e

CHANNEL_NAME=$1
: ${CHANNEL_NAME:="mychannel"}
echo $CHANNEL_NAME

export FABRIC_ROOT=$PWD
export FABRIC_CFG_PATH=$PWD
echo

OS_ARCH=$(echo "$(uname -s)-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')

## Using docker-compose template replace private key file names with constants
function replacePrivateKey () {
	ARCH=`uname -s | grep Darwin`
	if [ "$ARCH" == "Darwin" ]; then
		OPTS="-it"
	else
		OPTS="-i"
	fi

    #docker-compse-e2e.yaml
	cp docker-compose-e2e-template.yaml docker-compose-e2e.yaml

    CURRENT_DIR=$PWD
    cd crypto-config/peerOrganizations/org1.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-e2e.yaml

    cd crypto-config/peerOrganizations/org2.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-e2e.yaml

    #docker-compose-cli.yaml
    cp docker-compose-cli-template.yaml docker-compose-cli.yaml

    
    cd crypto-config/peerOrganizations/org1.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-cli.yaml

    cd crypto-config/peerOrganizations/org2.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-cli.yaml
}

## Generates Org certs using cryptogen tool
function generateCerts (){
	CRYPTOGEN=$FABRIC_ROOT/release/$OS_ARCH/bin/cryptogen

	if [ -f "$CRYPTOGEN" ]; then
            echo "Using cryptogen -> $CRYPTOGEN"
	else
	    echo "Building cryptogen"
	    make -C $FABRIC_ROOT release-all
	fi

	echo
	echo "##########################################################"
	echo "##### Generate certificates using cryptogen tool #########"
	echo "##########################################################"
	$CRYPTOGEN generate --config=./crypto-config.yaml
	echo
}

## Generate orderer genesis block , channel configuration transaction and anchor peer update transactions
function generateChannelArtifacts() {

	CONFIGTXGEN=$FABRIC_ROOT/release/$OS_ARCH/bin/configtxgen
	if [ -f "$CONFIGTXGEN" ]; then
            echo "Using configtxgen -> $CONFIGTXGEN"
	else
	    echo "Building configtxgen"
	    make -C $FABRIC_ROOT release-all
	fi

	echo "##########################################################"
	echo "#########  Generating Orderer Genesis block ##############"
	echo "##########################################################"
	$CONFIGTXGEN -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/orderer.genesis.block

	echo
	echo "#################################################################"
	echo "### Generating channel configuration transaction 'channel.tx' ###"
	echo "#################################################################"
	$CONFIGTXGEN -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID $CHANNEL_NAME
        
    $CONFIGTXGEN -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel1.tx -channelID mychannel1

	echo
	echo "#################################################################"
	echo "### Generating anchor peer update for Org1MSP/Org2MSP/Org3MSP ###"
	echo "#################################################################"
	for orgMsp in Org1MSP Org2MSP ; do
	    $CONFIGTXGEN -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/${orgMsp}anchors.tx -channelID $CHANNEL_NAME -asOrg $orgMsp
    done
	echo
	echo
}

generateCerts
replacePrivateKey
generateChannelArtifacts

