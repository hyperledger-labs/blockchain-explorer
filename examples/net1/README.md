# Hyperledger Explorer configuration for Docker

This folder contains the configuration settings of **Hyperledger Explorer**.

At Hyperledger Fabric network level, the differences between standard deployment and dockerized deployment is that:

* Crypto material is saved always under **/tmp/crypto**

As consequence, it needs to be references always as (see the example below):

```json
"admin": {
	"key": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
	"cert": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
}
```
For a complete **Hyperledger Fabric** network configuration file see examples:
https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/app/platform/fabric/config.json

## Docker networking

Dockerized deployment allows to have multiple **Explorer** instances in same machine or even in distributed machines (frontend/db) for production usage. In any case, following network is created by default.

* **Note**: network creation will fail if overlapping issues exist. Change default network creation settings or remove existing networks to continue.

```bash
Address:   192.168.10.0         11000000.10101000.00001010. 00000000
Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
Wildcard:  0.0.0.255            00000000.00000000.00000000. 11111111
=>
Network:   192.168.10.0/24      11000000.10101000.00001010. 00000000
HostMin:   192.168.10.1         11000000.10101000.00001010. 00000001
HostMax:   192.168.10.254       11000000.10101000.00001010. 11111110
Broadcast: 192.168.10.255       11000000.10101000.00001010. 11111111
Hosts/Net: 254                   Class C, Private Internet
```

This means that **by default**, created containers will have next configuration:

* Database instance will be at 192.168.10.11
* Frontend instance will be at 192.168.10.12
* Access to frontend will be at http://192.168.10.12:8080 or http://127.0.0.1:8080 (if port mapped enabled)

### Multiple network configurations.

Be aware that several configurations may coexist using same Hyperledger Explorer Docker images. Following shows an example of 2 different configurations (development and production) that might be applied to explorer deployment.

  ```bash
	  examples
		├── development
		│	├── config.json
		│	├── crypto
		│	│   ├── ordererOrganizations
		│	│   │   └── readme.txt
		│	│   ├── peerOrganizations
		│	│   │   └── readme.txt
		│	│   └── readme.txt
		│	└── README.md
		└── production
			├── config.json
			├── crypto
			│   ├── ordererOrganizations
			│   │   └── readme.txt
			│   ├── peerOrganizations
			│   │   └── readme.txt
			│   └── readme.txt
			└── README.md
  ```

## Example file

A complete configuration **example** file is shown below for 2 ORG Blockchain in where all containers have ports mapped and access is done via localhost/127.0.0.1:

```json
{
	"network-config": {
		"org1": {
			"name": "peerOrg1",
			"mspid": "Org1MSP",
			"peer1": {
				"requests": "grpcs://127.0.0.1:7051",
				"events": "grpcs://127.0.0.1:7053",
				"server-hostname": "peer0.org1.example.com",
				"tls_cacerts": "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
			},
			"peer2": {
				"requests": "grpcs://127.0.0.1:8051",
				"events": "grpcs://127.0.0.1:8053",
				"server-hostname": "peer1.org1.example.com",
				"tls_cacerts": "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt"
			},
			"admin": {
				"key": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
				"cert": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
			}
		},
		"org2": {
			"name": "peerOrg2",
			"mspid": "Org2MSP",
			"peer1": {
				"requests": "grpcs://127.0.0.1:9051",
				"events": "grpcs://127.0.0.1:9053",
				"server-hostname": "peer0.org2.example.com",
				"tls_cacerts": "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
			},
			"peer2": {
				"requests": "grpcs://127.0.0.1:10051",
				"events": "grpcs://127.0.0.1:10053",
				"server-hostname": "peer1.org2.example.com",
				"tls_cacerts": "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt"
			},
			"admin": {
				"key": "/tmp/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore",
				"cert": "/tmp/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts"
			}
		}
	},
	"channel": "main",
	"orderers": [{
		"mspid": "OrdererMSP",
		"server-hostname": "orderer.example.com",
		"requests": "grpcs://127.0.0.1:7050",
		"tls_cacerts": "/tmp/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
	}],
	"keyValueStore": "/tmp/fabric-client-kvs",
	"configtxgenToolPath": "fabric-path/fabric-samples/bin",
	"SYNC_START_DATE_FORMAT": "YYYY/MM/DD",
	"syncStartDate": "2018/01/01",
	"eventWaitTime": "30000",
	"license": "Apache-2.0",
	"version": "1.1"
}
```

Note: Make sure you put the right node IPs, ports and certs paths before running **Hyperledger Explorer**