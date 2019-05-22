
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## Configure to Hyperledger Explorer

Before Configure the Explorer config.json

Execute the below command and check peer/orderer is running up or not and verify ip too.

#### Code : docker ps

you can open the ~/fabric-tools/DevServer_connectio.json and check , channels , organizations,orderers and peers

based on that above file configuration we need to configure in Hyperledger Explorer config json ( network-config-name,mspid,peer(requests,events,server-hostname,tls_cacerts),admin(key,cert),channel and orderers(mspid,server_hostname,requests,tls_cacerts).

- Sample configuration provided, see file: blockchain-explorer/app/platform/fabric/config-composer.json.

## Run Hyperledger Explorer

**Code : cd blockchain-explorer/**

**./start.sh (It will have the backend up)**

Launch the Hyperledger explorer URL
