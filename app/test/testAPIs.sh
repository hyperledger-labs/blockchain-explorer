#!/bin/bash

#
# SPDX-License-Identifier: Apache-2.0
#
#
# created by Cam Mach.
#

starttime=$(date +%s)

#//release-3.1
echo
echo "POST request Create channel ..."
echo
curl -s -X POST \
  http://localhost:8080/api/channel \
  -H "content-type: application/json" \
  -d '{
    "orgName":"org1",
	"channelName":"hellochannel",
	"channelConfigPath":"../fabric-samples/first-network/hellochannel.tx",
	"orgPath":"../fabric-samples/first-network/channel-artifacts/org1.yaml",
	"networkCfgPath":"../fabric-samples/first-network/network-config.yaml"
     }'
echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
