
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Hyperledger Explorer [![join the chat][rocketchat-image]][rocketchat-url] [![](https://img.shields.io/badge/Stack%20Overflow-Hyperledger%20Explorer-brightgreen)](https://stackoverflow.com/search?tab=newest&q=hyperledger%20explorer%20hyperledger-explorer)

[rocketchat-url]:https://chat.hyperledger.org/channel/hyperledger-explorer
[rocketchat-image]:https://open.rocket.chat/images/join-chat.svg
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/hyperledger/blockchain-explorer?sort=semver)](https://github.com/hyperledger/blockchain-explorer/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/hyperledger/explorer)](https://hub.docker.com/r/hyperledger/explorer)
![node-current](https://img.shields.io/node/v/fabric-network?color=blue)<br />
[![Build Status](https://dev.azure.com/Hyperledger/blockchain-explorer/_apis/build/status/Blockchain-Explorer?branchName=master)](https://dev.azure.com/Hyperledger/blockchain-explorer/_build/latest?definitionId=41&branchName=master)
[![CII Best Practice](https://bestpractices.coreinfrastructure.org/projects/2710/badge)](https://bestpractices.coreinfrastructure.org/projects/2710)
[![Documentation Status](https://readthedocs.org/projects/blockchain-explorer/badge/?version=master)](https://blockchain-explorer.readthedocs.io/en/master/?badge=master)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/hyperledger/blockchain-explorer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyperledger/blockchain-explorer/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/hyperledger/blockchain-explorer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyperledger/blockchain-explorer/alerts/)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=hyperledger_blockchain-explorer&metric=alert_status)](https://sonarcloud.io/dashboard?id=hyperledger_blockchain-explorer)
<!-- badges -->

![](docs/source/images/Hyperledger_Explorer_Logo_Color.png)

Hyperledger Explorer is a simple, powerful, easy-to-use, well maintained, open source utility to browse activity on the underlying blockchain network. Users have the ability to configure and build Hyperledger Explorer on MacOS and Ubuntu.

**Update!** Hyperledger Explorer now can be used with [**Hyperledger Iroha**](https://github.com/hyperledger/iroha). For Iroha support, please switch to [iroha-integration](../../tree/iroha-integration) branch and read this [README](../../tree/iroha-integration/iroha) for instructions on how to use it. 


# Release Notes

| Hyperledger Explorer Version                                | Fabric Version Supported                                         | NodeJS Version Supported                          |
| --                                                          | --                                                               | --                                                |
| <b>[v1.1.2](release_notes/v1.1.2.md)</b> (Aug 12, 2020)  | [v1.4.0 to v2.2.0](https://hyperledger-fabric.readthedocs.io/en/release-2.2) | [12.16.x](https://nodejs.org/en/download/releases) |
| <b>[v1.1.1](release_notes/v1.1.1.md)</b> (Jul 17, 2020)  | [v1.4.0 to v2.1.1](https://hyperledger-fabric.readthedocs.io/en/release-2.1) | [12.16.x](https://nodejs.org/en/download/releases) |
| <b>[v1.1.0](release_notes/v1.1.0.md)</b> (Jul 01, 2020)  | [v1.4.0 to v2.1.1](https://hyperledger-fabric.readthedocs.io/en/release-2.1) | [12.16.x](https://nodejs.org/en/download/releases) |
| <b>[v1.0.0](release_notes/v1.0.0.md)</b> (Apr 09, 2020)  | [v1.4.0 to v1.4.8](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [10.19.x](https://nodejs.org/en/download/releases) |
| <b>[v1.0.0-rc3](release_notes/v1.0.0-rc3.md)</b> (Apr 01, 2020)  | [v1.4.0 to v1.4.6](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [10.19.x](https://nodejs.org/en/download/releases) |
| <b>[v1.0.0-rc2](release_notes/v1.0.0-rc2.md)</b> (Dec 10, 2019)  | [v1.4.0 to v1.4.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |
| <b>[v1.0.0-rc1](release_notes/v1.0.0-rc1.md)</b> (Nov 18, 2019)  | [v1.4.2](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |

---

There are 2 options to get Explorer started. Following are the software dependencies required for each option.
And if you want to refer more detail of each configuration, please refer [README-CONFIG.md](README-CONFIG.md).

# Quick start (using Docker)

## Prerequisites

* Docker
* Docker Compose
  * **Note:**
    The following docker images are automatically pulled from Docker Hub when starting docker-compose.

    * [Hyperledger Explorer docker repository](https://hub.docker.com/r/hyperledger/explorer/)
    * [Hyperledger Explorer PostgreSQL docker repository](https://hub.docker.com/r/hyperledger/explorer-db)

## Start Hyperledger Fabric network

In this guide, we assume that you've already started test network by following [Hyperledger Fabric official tutorial](https://hyperledger-fabric.readthedocs.io/en/master/test_network.html).

## Configure

* Copy the following files from repository

  - [docker-compose.yaml](https://github.com/hyperledger/blockchain-explorer/blob/master/docker-compose.yaml)
  - [examples/net1/connection-profile/first-network.json](https://github.com/hyperledger/blockchain-explorer/blob/master/examples/net1/connection-profile/first-network.json)
  - [examples/net1/config.json](https://github.com/hyperledger/blockchain-explorer/blob/master/examples/net1/config.json)


  ```
  $ wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/examples/net1/config.json
  $ wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/examples/net1/connection-profile/first-network.json -P connection-profile
  $ wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/docker-compose.yaml
  ```

* Copy entire crypto artifact directory (e.g. crypto-config/, organizations/) from your fabric network

* Now you should have the following files and directory structure.

    ```
    docker-compose.yaml
    config.json
    connection-profile/first-network.json
    organizations/ordererOrganizations/
    organizations/peerOrganizations/
    ```

* Edit network name and path to volumes to be mounted on Explorer container (docker-compose.yaml) to align with your environment

    ```yaml
        networks:
        mynetwork.com:
            external:
                name: net_test

        ...

        services:
          explorer.mynetwork.com:

            ...

            volumes:
              - ./config.json:/opt/explorer/app/platform/fabric/config.json
              - ./connection-profile:/opt/explorer/app/platform/fabric/connection-profile
              - ./organizations:/tmp/crypto
              - walletstore:/opt/wallet
    ```

* When you connect Explorer to your fabric network through bridge network, you need to set DISCOVERY_AS_LOCALHOST to false for disabling hostname mapping into localhost.

    ```yaml
    services:

      ...

      explorer.mynetwork.com:

        ...

        environment:
          - DISCOVERY_AS_LOCALHOST=false
    ```

* Edit path to admin certificate and secret key in the connection profile (first-network.json). You need to specify with the absolute path on Explorer container.

    ```json
      "organizations": {
        "Org1MSP": {
          "adminPrivateKey": {
            "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk"
    ```

## Start container services

* Run the following to start up explore and explorer-db services after starting your fabric network:

    ```shell
    $ docker-compose up -d
    ```

## Clean up

* To stop services without removing persistent data, run the following:

    ```shell
    $ docker-compose down
    ```

* In the docker-compose.yaml, two named volumes are allocated for persistent data (for Postgres data and user wallet), if you would like to clear these named volumes up, run the following:

    ```shell
    $ docker-compose down -v
    ```



# Quick start (using codebase)

## Prerequisites

* Nodejs 10 and 12 (10.19 and 12.16 tested)
* PostgreSQL 9.5 or greater
* [jq](https://stedolan.github.io/jq)
* Linux-based operating system, such as Ubuntu or MacOS
* golang (optional)
  * For e2e testing

## Start Hyperledger Fabric network

In this guide, we assume that you've already started test network by following [Hyperledger Fabric official tutorial](https://hyperledger-fabric.readthedocs.io/en/master/test_network.html).

## Clone GIT Repository

Clone this repository to get the latest using the following command.

```shell
$ git clone https://github.com/hyperledger/blockchain-explorer.git
$ cd blockchain-explorer
```

## Database Setup

```
$ cd blockchain-explorer/app
```

* Modify `app/explorerconfig.json` to update PostgreSQL database settings.

    ```json
    "postgreSQL": {
        "host": "127.0.0.1",
        "port": "5432",
        "database": "fabricexplorer",
        "username": "hppoc",
        "passwd": "password"
    }
    ```

  * Another alternative to configure database settings is to use environment variables, example of settings:

    ```shell
    export DATABASE_HOST=127.0.0.1
    export DATABASE_PORT=5432
    export DATABASE_DATABASE=fabricexplorer
    export DATABASE_USERNAME=hppoc
    export DATABASE_PASSWD=pass12345
    ```
  **Important** repeat after every git pull (in some case you may need to apply permission to db/ directory, from blockchain-explorer/app/persistence/fabric/postgreSQL run: `chmod -R 775 db/`

## Update configuration

* Modify `app/platform/fabric/config.json` to define your fabric network connection profile:

    ```json
    {
        "network-configs": {
            "first-network": {
                "name": "firstnetwork",
                "profile": "./connection-profile/first-network.json",
                "enableAuthentication": false
            }
        },
        "license": "Apache-2.0"
    }
    ```

  * `first-network` is the name of your connection profile, and can be changed to any name
  * `name` is a name you want to give to your fabric network, you can change only value of the key `name`
  * `profile` is the location of your connection profile, you can change only value of the key `profile`

* Modify connection profile in the JSON file `app/platform/fabric/connection-profile/first-network.json`:
  * Change `fabric-path` to your fabric network disk path in the first-network.json file:
  * Provide the full disk path to the adminPrivateKey config option, it ussually ends with `_sk`, for example:
    `/fabric-path/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/aaacd899a6362a5c8cc1e6f86d13bfccc777375365bbda9c710bb7119993d71c_sk`
  * `adminUser` and `adminPassword` is the credential for user of Explorer to login the dashboard
  * `enableAuthentication` is a flag to enable authentication using a login page, setting to false will skip authentication.

## Run create database script:

* **Ubuntu**

    ```
    $ cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
    $ sudo -u postgres ./createdb.sh
    ```

* **MacOS**

    ```
    $ cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
    $ ./createdb.sh
    ```

Connect to the PostgreSQL database and run DB status commands:

```shell
$ sudo -u postgres psql -c '\l'
                                List of databases
      Name      |  Owner   | Encoding | Collate |  Ctype  |   Access privileges
----------------+----------+----------+---------+---------+-----------------------
 fabricexplorer | hppoc    | UTF8     | C.UTF-8 | C.UTF-8 |
 postgres       | postgres | UTF8     | C.UTF-8 | C.UTF-8 |
 template0      | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
                |          |          |         |         | postgres=CTc/postgres
 template1      | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
                |          |          |         |         | postgres=CTc/postgres
(4 rows)

$ sudo -u postgres psql fabricexplorer -c '\d'
                   List of relations
 Schema |           Name            |   Type   | Owner
--------+---------------------------+----------+-------
 public | blocks                    | table    | hppoc
 public | blocks_id_seq             | sequence | hppoc
 public | chaincodes                | table    | hppoc
 public | chaincodes_id_seq         | sequence | hppoc
 public | channel                   | table    | hppoc
 public | channel_id_seq            | sequence | hppoc
 public | orderer                   | table    | hppoc
 public | orderer_id_seq            | sequence | hppoc
 public | peer                      | table    | hppoc
 public | peer_id_seq               | sequence | hppoc
 public | peer_ref_chaincode        | table    | hppoc
 public | peer_ref_chaincode_id_seq | sequence | hppoc
 public | peer_ref_channel          | table    | hppoc
 public | peer_ref_channel_id_seq   | sequence | hppoc
 public | transactions              | table    | hppoc
 public | transactions_id_seq       | sequence | hppoc
 public | write_lock                | table    | hppoc
 public | write_lock_write_lock_seq | sequence | hppoc
(18 rows)

```

## Build Hyperledger Explorer

**Important:** repeat the below steps after every git pull

* `./main.sh install`
  * To install, run tests, and build project
- `./main.sh clean`
  * To clean the /node_modules, client/node_modules client/build, client/coverage, app/test/node_modules
   directories

Or

```
$ cd blockchain-explorer
$ npm install
$ cd client/
$ npm install
$ npm run build
```

## Run Hyperledger Explorer 

### Run Locally in Same Location

* Modify `app/explorerconfig.json` to update sync settings.

    ```json
    "sync": {
      "type": "local"
    }   
    ```

* `./start.sh`
  * It will have the backend and GUI service up

* `./stop.sh`
  * It will stop the node server

**Note:** If Hyperledger Fabric network is deployed on other machine, please define the following environment variable

```
$ DISCOVERY_AS_LOCALHOST=false ./start.sh
```

### Run Standalone in Different Location

* Modify `app/explorerconfig.json` to update sync settings.

    ```json
    "sync": {
      "type": "host"
    }   
    ```

* If the Hyperledger Explorer was used previously in your browser be sure to clear the cache before relaunching

* `./syncstart.sh`
  * It will have the sync node up

* `./syncstop.sh`
  * It will stop the sync node

**Note:** If Hyperledger Fabric network is deployed on other machine, please define the following environment variable

```
$ DISCOVERY_AS_LOCALHOST=false ./syncstart.sh
```

# Configuration

Please refer [README-CONFIG.md](README-CONFIG.md) for more detail of each configuration.


# Logs

* Please visit the `./logs/console` folder to view the logs relating to console and `./logs/app` to view the application logs and visit the `./logs/db` to view the database logs.

# Troubleshooting

Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.

# License

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.
