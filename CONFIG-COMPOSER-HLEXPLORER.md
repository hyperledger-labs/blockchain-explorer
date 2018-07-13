## Configure to Hyperledger Explorer

Before Configure the Explorer config.json

Execute the below command and check peer/orderer is running up or not and verify ip too.

#### Code : docker ps

you can open the ~/fabric-tools/DevServer_connectio.json and check , channels , organizations,orderers and peers

based on that above file configuration we need to configure in Hyperledger Explorer config json ( network-config-name,mspid,peer(requests,events,server-hostname,tls_cacerts),admin(key,cert),channel and orderers(mspid,server_hostname,requests,tls_cacerts).

```
{

 network-config: {
  org1: {
   name: Org1,
   mspid: Org1MSP,
   peer1: {
    requests: grpc://127.0.0.1:7051,
    events: grpc://127.0.0.1:7053,
    server-hostname: peer0.org1.example.com,
    tls_cacerts: /home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
   },

   admin: {
    key: /home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore,
    cert: /home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts
   }
  }
 },

 channel: composerchannel,
 orderers: [{
  mspid: OrdererMSP,
  server-hostname: orderer.example.com,
  requests: grpc://127.0.0.1:7050,
  tls_cacerts: /home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
 }],

 keyValueStore: /tmp/fabric-client-kvs,
 configtxgenToolPath: /home/playground/fabric-samples/bin,
 SYNC_START_DATE_FORMAT: YYYY/MM/DD,
 syncStartDate: 2018/01/01,
 eventWaitTime: 30000,
 license: Apache-2.0,
 version: 1.0
}
```

## Run Hyperledger Explorer

**Code : cd blockchain-explorer/**

**./start.sh (It will have the backend up)**

Launch the Blockchain explorer URL