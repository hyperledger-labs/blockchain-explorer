#!/bin/bash
#
# created by Cam Mach.
#

starttime=$(date +%s)


echo
echo "POST request Create channel ..."
echo
curl -s -X POST \
  http://localhost:8080/api/channel \
  -H "content-type: application/json" \
  -d '{
    "orgName":"org1",
	"channelName":"mychannel",
	"channelConfigPath":"/home/cam/hyperledger_git/fabric-samples/balance-transfer/artifacts/channel/mychannel.tx",
	"orgPath":"/home/cam/hyperledger_git/fabric-samples/balance-transfer/artifacts/org1.yaml",
	"networkCfgPath":"/home/cam/hyperledger_git/fabric-samples/balance-transfer/artifacts/network-config.yaml"
     }'
echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
