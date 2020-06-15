#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CHPROFILE=testorgschannel
function genChTx()
{
  ch=$1
  pushd ${SCRIPTPATH}/configFiles
  mkdir -p ../channel-artifacts/$ch
  configtxgen -configPath . -profile ${CHPROFILE} -outputCreateChannelTx ../channel-artifacts/${ch}/${ch}.tx -channelID ${ch} 
  popd
}

function genAnchorTx()
{
  ch=$1
  org=$2
  pushd ${SCRIPTPATH}/configFiles
  mkdir -p ../channel-artifacts/$ch
  configtxgen -configPath . -profile ${CHPROFILE} -outputAnchorPeersUpdate ../channel-artifacts/${ch}/${ch}org${org}anchor.tx -channelID ${ch} -asOrg org${org}
  popd
}

genChTx commonchannel
genChTx org1channel
genChTx channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422
genChTx org2channel

genAnchorTx commonchannel 1
genAnchorTx commonchannel 2
genAnchorTx org1channel 1
genAnchorTx channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422 1
genAnchorTx org2channel 2
