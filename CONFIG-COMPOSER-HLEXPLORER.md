**Configure to Hyperledger Explorer**

Before Configure the Explorer config.json

Execute the below command and check peer/orderer is running up or not and verify ip too.

**Code : docker ps**

you can open the ~/fabric-tools/DevServer\_connectio.json and check , channels , organizations,orderers and peers

based on that above file configuration we need to configure in Hyperledger Explorer config json ( network-config – name,mspid,peer(requests,events,server-hostname,tls\_cacerts),admin(key,cert),channel and orderers(mspid,server\_hostname,requests,tls\_cacerts).

{

 &quot;network-config&quot;: {

  &quot;org1&quot;: {

   &quot;name&quot;: &quot;Org1&quot;,

   &quot;mspid&quot;: &quot;Org1MSP&quot;,

   &quot;peer1&quot;: {

    &quot;requests&quot;: &quot;grpc://127.0.0.1:7051&quot;,

    &quot;events&quot;: &quot;grpc://127.0.0.1:7053&quot;,

    &quot;server-hostname&quot;: &quot;peer0.org1.example.com&quot;,

    &quot;tls\_cacerts&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt&quot;

   },

   &quot;admin&quot;: {

    &quot;key&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore&quot;,

    &quot;cert&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts&quot;

   }

  }

 },

 &quot;channel&quot;: &quot;composerchannel&quot;,

 &quot;orderers&quot;: [{

  &quot;mspid&quot;: &quot;OrdererMSP&quot;,

  &quot;server-hostname&quot;: &quot;orderer.example.com&quot;,

  &quot;requests&quot;: &quot;grpc://127.0.0.1:7050&quot;,

  &quot;tls\_cacerts&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt&quot;

 }],

 &quot;keyValueStore&quot;: &quot;/tmp/fabric-client-kvs&quot;,

 &quot;configtxgenToolPath&quot;: &quot;/home/playground/fabric-samples/bin&quot;,

 &quot;SYNC\_START\_DATE\_FORMAT&quot;: &quot;YYYY/MM/DD&quot;,

 &quot;syncStartDate&quot;: &quot;2018/01/01&quot;,

 &quot;eventWaitTime&quot;: &quot;30000&quot;,

 &quot;license&quot;: &quot;Apache-2.0&quot;,

 &quot;version&quot;: &quot;1.1&quot;

}

**Run Hyperledger Explorer :**

**Code : cd blockchain-explorer/**

**./start.sh (It will have the backend up)**

Launch the Blockchain explorer URL