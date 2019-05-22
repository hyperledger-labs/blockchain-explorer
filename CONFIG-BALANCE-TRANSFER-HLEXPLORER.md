
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## Configure to Hyperledger Explorer

Before Configure the Explorer blockchain-explorer/app/platform/fabric/config.json

- Modify config.json to define you fabric network connection profile
            ``` {
        "network-configs": {
            "balance-transfer": {
            "name": "balancetransfer",
            "profile": "./connection-profile/balance-transfer.json"
            }
        },
        "license": "Apache-2.0"
        }```

    - "balance-transfer" is the name of your connection profile, can be changed to any name
	- "name" is a name you want to give to your fabric network, you can change only value of the key "name"
	- "profile" is the location of your connection profile, you can change only value of the key "profile"

- Modify connection profile
	- Change "fabric-path" to your fabric network path in file /blockchain-explorer/app/platform/fabric/connection-profile/balance-transfer.json, or create another file and specify the path to it, as long as it keeps same format.
	- Provide full path to the adminPrivateKey config option, it ussually ends with "_sk", example:
	```"/fabric-path/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/aaacd899a6362a5c8cc1e6f86d13bfccc777375365bbda9c710bb7119993d71c_sk"```
    - Update all the "fabric-path" accordingly to your balance transfer network location
    - "tlsEnable" true|false handles the protocol
	- "adminUser" is the the admin user of the network, in this case is fabric CA or an identity user
    - "adminPassword" is the password for the admin user.
	- "enableAuthentication" true|false, is a flag to enable authentication using a login page, false will skip authentication

## Run Hyperledger Explorer

**Code : cd blockchain-explorer/**

**./start.sh (It will have the backend up)**

Launch the Hyperledger explorer URL
