
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Hyperledger Explorer configuration for Docker

This folder contains the configuration settings of **Hyperledger Explorer**.

At Hyperledger Fabric network level, the differences between standard deployment and dockerized deployment is that:

* Crypto material is saved always under **/tmp/crypto** (can be configured in [deploy_explorer.sh](../../deploy_explorer.sh) )

As consequence, it needs to be references always as (see the example below):

```json
"tlsCACerts": {
  "path": "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
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
  "network-configs": {
    "network-1": {
      "version": "1.0",
      "clients": {
        "client-1": {
          "tlsEnable": true,
          "organization": "Org1MSP",
          "channel": "mychannel",
          "credentialStore": {
            "path": "./tmp/credentialStore_Org1/credential",
            "cryptoStore": {
              "path": "./tmp/credentialStore_Org1/crypto"
            }
          }
        }
      },
      "channels": {
        "mychannel": {
          "peers": {
            "peer0.org1.example.com": {}
          },
          "connection": {
            "timeout": {
              "peer": {
                "endorser": "6000",
                "eventHub": "6000",
                "eventReg": "6000"
              }
            }
          }
        }
      },
      "organizations": {
        "Org1MSP": {
          "mspid": "Org1MSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
          },
          "signedCert": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
          }
        },
        "Org2MSP": {
          "mspid": "Org2MSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore"
          }
        },
        "OrdererMSP": {
          "mspid": "OrdererMSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/ordererOrganizations/example.com/users/Admin@example.com/msp/keystore"
          }
        }
      },
      "peers": {
        "peer0.org1.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
          },
          "url": "grpcs://localhost:7051",
          "eventUrl": "grpcs://localhost:7053",
          "grpcOptions": {
            "ssl-target-name-override": "peer0.org1.example.com"
          }
        },
        "peer1.org1.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt"
          },
          "url": "grpcs://localhost:8051",
          "eventUrl": "grpcs://localhost:8053",
          "grpcOptions": {
            "ssl-target-name-override": "peer1.org1.example.com"
          }
        },
        "peer0.org2.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
          },
          "url": "grpcs://localhost:9051",
          "eventUrl": "grpcs://localhost:9053",
          "grpcOptions": {
            "ssl-target-name-override": "peer0.org2.example.com"
          }
        },
        "peer1.org2.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt"
          },
          "url": "grpcs://localhost:10051",
          "eventUrl": "grpcs://localhost:10053",
          "grpcOptions": {
            "ssl-target-name-override": "peer1.org2.example.com"
          }
        }
      },
      "orderers": {
        "orderer.example.com": {
          "url": "grpcs://localhost:7050"
        }
      }
    }
  },
  "configtxgenToolPath": "/fabric-path/workspace/fabric-samples/bin",
  "license": "Apache-2.0"
}
```

Note: Make sure you put the right node IPs, ports and certs paths before running **Hyperledger Explorer**

### Example of running BE with [Fabric Network](https://github.com/hyperledger/fabric-samples/tree/master/first-network)

1. Follow the instruction how to run the Blockchain network.
2. Copy crypto materials from the `fabric-network/crypto-config` to `./examples/<your_folder>/crypto`.
3. Update your `config.json` to something similar to
```json
{
  "network-configs": {
    "network-1": {
      "version": "1.0",
      "clients": {
        "client-1": {
          "tlsEnable": true,
          "organization": "Org1MSP",
          "channel": "mychannel",
          "credentialStore": {
            "path": "./tmp/credentialStore_Org1/credential",
            "cryptoStore": {
              "path": "./tmp/credentialStore_Org1/crypto"
            }
          }
        }
      },
      "channels": {
        "mychannel": {
          "peers": {
            "peer0.org1.example.com": {}
          },
          "connection": {
            "timeout": {
              "peer": {
                "endorser": "6000",
                "eventHub": "6000",
                "eventReg": "6000"
              }
            }
          }
        }
      },
      "organizations": {
        "Org1MSP": {
          "mspid": "Org1MSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
          },
          "signedCert": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
          }
        },
        "Org2MSP": {
          "mspid": "Org2MSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore"
          }
        },
        "OrdererMSP": {
          "mspid": "OrdererMSP",
          "adminPrivateKey": {
            "path":
              "/tmp/crypto/ordererOrganizations/example.com/users/Admin@example.com/msp/keystore"
          }
        }
      },
      "peers": {
        "peer0.org1.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
          },
          "url": "grpcs://peer0.org1.example.com:7051",
          "eventUrl": "grpcs://peer0.org1.example.com:7053",
          "grpcOptions": {
            "ssl-target-name-override": "peer0.org1.example.com"
          }
        },
        "peer1.org1.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt"
          },
          "url": "grpcs://peer1.org1.example.com:7051",
          "eventUrl": "grpcs://peer1.org1.example.com:7053",
          "grpcOptions": {
            "ssl-target-name-override": "peer1.org1.example.com"
          }
        },
        "peer0.org2.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
          },
          "url": "grpcs://peer0.org2.example.com:7051",
          "eventUrl": "grpcs://peer0.org2.example.com:7053",
          "grpcOptions": {
            "ssl-target-name-override": "peer0.org2.example.com"
          }
        },
        "peer1.org2.example.com": {
          "tlsCACerts": {
            "path":
              "/tmp/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt"
          },
          "url": "grpcs://peer1.org2.example.com:7051",
          "eventUrl": "grpcs://peer1.org2.example.com:7053",
          "grpcOptions": {
            "ssl-target-name-override": "peer1.org2.example.com"
          }
        }
      },
      "orderers": {
        "orderer.example.com": {
          "url": "grpcs://orderer.example.com:7050"
        }
      }
    }
  },
  "configtxgenToolPath": "/home/fabric-path/workspace/fabric-samples/bin",
  "license": "Apache-2.0"
}
```

4. in case if port 8080 is occupied in your system, the `deploy_explorer.sh` should be updated. Please update the line 193
`-p 8080:8080 \` to `-p <port>:8080 \`, where <port> is a free port, where BE can be browsed.
5. issue `./deploy_explorer.sh <your_folder> net_byfn` and wait, example: `./deploy_explorer.sh net1 net_byfn`
6. open the browser `http://localhost:<port>` and explore the blockchain network.

### Docker Troubleshooting commands
    List your networks
    $docker network ls
    List docker images id
    $docker images | grep block
    Remove an image
    $docker rmi <image_id>
    Login to docker
    $docker exec -it <image_id> sh
    Read explorer app log
    $docker exec <image_id> cat /opt/logs/app/app.log
    Inspect real IP's
    $docker inspect <image_id> | grep IPAddress
    Stop and remove dockers
    $docker stop $(docker ps -a -q)
    $docker rm -f $(docker ps -a -q)
    Remove default fabric crypto
    $rm -rf ./crypto-config/*
    $rm -rf ~/.hfc*
    From the docker ($docker exec -it <image_id> sh)
    Install curl:
    $apk update && apk add curl
    Use curl in docker to query explorer REST API
    Example:
    $curl http://localhost:8080/api/channels
    Example response: {"status":200,"channels":["dockerchannel","mychannel"]
