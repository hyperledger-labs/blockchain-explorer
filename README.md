<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Hyperledger Explorer

:warning: :warning: :warning:

**Hyperledger Explorer has been moved to End of Life status by the original project maintainers.  Although Hyperledger Explorer is not currently being developed or maintained, the code is still available under an open source license so you would be welcome to reactivate this project. If you are interested in continuing development of this code, please consider submitting a PR at https://github.com/hyperledger/hyperledger-hip and sending and email to tsc@lists.hyperledger.org. See more details about project proposals at: https://hyperledger.github.io/hyperledger-hip/**

**If you wish to contribute, please reach out to the [TSC mailing list](https://lists.hyperledger.org/g/tsc/messages)**

:warning: :warning: :warning:

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/hyperledger/blockchain-explorer?sort=semver)](https://github.com/hyperledger/blockchain-explorer/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/hyperledger/explorer)](https://hub.docker.com/r/hyperledger/explorer)
![node-current](https://img.shields.io/node/v/fabric-network?color=blue)<br />
[![Build Status](https://dev.azure.com/Hyperledger/blockchain-explorer/_apis/build/status/Blockchain-Explorer?branchName=main)](https://dev.azure.com/Hyperledger/blockchain-explorer/_build/latest?definitionId=41&branchName=main)
[![CII Best Practice](https://bestpractices.coreinfrastructure.org/projects/2710/badge)](https://bestpractices.coreinfrastructure.org/projects/2710)
[![Documentation Status](https://readthedocs.org/projects/blockchain-explorer/badge/?version=main)](https://blockchain-explorer.readthedocs.io/en/main/?badge=main)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/hyperledger/blockchain-explorer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyperledger/blockchain-explorer/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/hyperledger/blockchain-explorer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyperledger/blockchain-explorer/alerts/)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=hyperledger_blockchain-explorer&metric=alert_status)](https://sonarcloud.io/dashboard?id=hyperledger_blockchain-explorer)
<!-- badges -->

![](docs/source/images/Hyperledger_Explorer_Logo_Color.png)

Hyperledger Explorer is a simple, powerful, easy-to-use, well-maintained, open-source utility to browse activity on the underlying blockchain network. Users can configure and build Hyperledger Explorer on macOS and Ubuntu.

**Update!** Hyperledger Explorer now can be used with [**Hyperledger Iroha**](https://github.com/hyperledger/iroha). For Iroha support, please switch to [iroha-integration](../../tree/iroha-integration) branch and read this [README](../../tree/iroha-integration/iroha) for instructions on how to use it.


# Release Notes

| Hyperledger Explorer Version                                | Fabric Version Supported                                         | NodeJS Version Supported                          |
| --                                                          | --                                                               | --                                                |
| <b>[v1.1.8](release_notes/v1.1.8.md)</b> (Aug 14, 2021)  | [v1.4 to v2.3](https://hyperledger-fabric.readthedocs.io/en/release-2.3) | [^12.13.1, ^14.13.1, ^16.14.1](https://nodejs.org/en/download/releases) |
| <b>[v1.1.7](release_notes/v1.1.7.md)</b> (Jul 04, 2021)  | [v1.4 to v2.3](https://hyperledger-fabric.readthedocs.io/en/release-2.3) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |
| <b>[v1.1.6](release_notes/v1.1.6.md)</b> (Jun 06, 2021)  | [v1.4 to v2.3](https://hyperledger-fabric.readthedocs.io/en/release-2.3) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |
| <b>[v1.1.5](release_notes/v1.1.5.md)</b> (Apr 20, 2021)  | [v1.4 to v2.3](https://hyperledger-fabric.readthedocs.io/en/release-2.3) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |
| <b>[v1.1.4](release_notes/v1.1.4.md)</b> (Jan 29, 2021)  | [v1.4 to v2.2](https://hyperledger-fabric.readthedocs.io/en/release-2.2) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |
| <b>[v1.1.3](release_notes/v1.1.3.md)</b> (Sep 28, 2020)  | [v1.4.0 to v2.2.0](https://hyperledger-fabric.readthedocs.io/en/release-2.2) | [12.16.x](https://nodejs.org/en/download/releases) |
| <b>[v1.1.2](release_notes/v1.1.2.md)</b> (Aug 12, 2020)  | [v1.4.0 to v2.2.0](https://hyperledger-fabric.readthedocs.io/en/release-2.2) | [12.16.x](https://nodejs.org/en/download/releases) |

---

There are 2 options to get Explorer started. Following are the software dependencies required for each option.
And if you want to know more about each configuration, please refer [README-CONFIG.md](README-CONFIG.md).

# Quick start (using Docker)

## Prerequisites

* Docker
* Docker Compose
  * **Note:**
    The following docker images are automatically pulled from Docker Hub when starting docker-compose.

    * [Hyperledger Explorer docker repository](https://hub.docker.com/r/hyperledger/explorer/)
    * [Hyperledger Explorer PostgreSQL docker repository](https://hub.docker.com/r/hyperledger/explorer-db)

## Start Hyperledger Fabric network

This guide assumes that you've already started the test network by following [Hyperledger Fabric official tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html).

## Configure

* Create a new directory (e.g. `explorer`)

    ```bash
    mkdir explorer
    cd explorer
    ```

* Copy the following files from the repository

  - [.env](https://github.com/hyperledger/blockchain-explorer/blob/main/.env)
  - [docker-compose.yaml](https://github.com/hyperledger/blockchain-explorer/blob/main/docker-compose.yaml)
  - [examples/net1/connection-profile/test-network.json](https://github.com/hyperledger/blockchain-explorer/blob/main/examples/net1/connection-profile/test-network.json)
  - [examples/net1/config.json](https://github.com/hyperledger/blockchain-explorer/blob/main/examples/net1/config.json)


  ```bash
  wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/main/examples/net1/config.json
  wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/main/examples/net1/connection-profile/test-network.json -P connection-profile
  wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/main/docker-compose.yaml
  ```

* Copy entire crypto artifact directory (organizations/) from your fabric network (e.g /fabric-samples/test-network)

    ```bash
    cp -r ../fabric-samples/test-network/organizations/ .
    ```

* Now, you should have the following files and directory structure.

    ```
    docker-compose.yaml
    config.json
    connection-profile/test-network.json
    organizations/ordererOrganizations/
    organizations/peerOrganizations/
    ```

* Edit environmental variables in `docker-compose.yaml` to align with your environment

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
              - walletstore:/opt/explorer/wallet
    ```

    An alternative option is to export environment variables in your shell.

    ```bash
    export EXPLORER_CONFIG_FILE_PATH=./config.json
    export EXPLORER_PROFILE_DIR_PATH=./connection-profile
    export FABRIC_CRYPTO_PATH=./organizations
    ```

* When you connect Explorer to your fabric network through the bridge network, you need to set `DISCOVERY_AS_LOCALHOST` to `false` for disabling hostname mapping into localhost.

    ```yaml
    services:

      ...

      explorer.mynetwork.com:

        ...

        environment:
          - DISCOVERY_AS_LOCALHOST=false
    ```

* Replace the user's certificate with an admin certificate and a secret (private) key in the connection profile (test-network.json). You need to specify the absolute path on the Explorer container.

    Before:
    ```json
    "adminPrivateKey": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk"
    }
    ```

    After:
    ```json
    "adminPrivateKey": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk"
    }
    ```
    **Make sure you replace all paths.**

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

* In the docker-compose.yaml, two named volumes are allocated for persistent data (for Postgres data and user wallet). If you would like to clear these named volumes up, run the following:

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

This guide assumes that you've already started the test network by following [Hyperledger Fabric official tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html).

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

  * Another alternative to configuring database settings is to use environment variables:

    ```shell
    export DATABASE_HOST=127.0.0.1
    export DATABASE_PORT=5432
    export DATABASE_DATABASE=fabricexplorer
    export DATABASE_USERNAME=hppoc
    export DATABASE_PASSWD=pass12345
    ```
  **Important** repeat after every git pull (in some cases, you may need to apply permission to db/ directory, from blockchain-explorer/app/persistence/fabric/postgreSQL run: `chmod -R 775 db/`

## Update configuration

* Modify `app/platform/fabric/config.json` to define your fabric network connection profile:

    ```json
    {
        "network-configs": {
            "test-network": {
                "name": "Test Network",
                "profile": "./connection-profile/test-network.json",
                "enableAuthentication": false
            }
        },
        "license": "Apache-2.0"
    }
    ```

  * `test-network` is the name of your connection profile and can be changed to any name
  * `name` is a name you want to give to your fabric network. You can change the only value of the key `name`
  * `profile` is the location of your connection profile. You can change the only value of the key `profile`

* Modify connection profile in the JSON file `app/platform/fabric/connection-profile/test-network.json`:
  * Change `fabric-path` to your fabric network disk path in the test-network.json file:
  * Provide the full disk path to the adminPrivateKey config option. It usually ends with `_sk`, for example:
    `/fabric-path/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk`
  * `adminUser` and `adminPassword` is the credential for the user of Explorer to log in to the dashboard
  * `enableAuthentication` is a flag to enable authentication using a login page. Setting to false will skip authentication.

## Run `create` database script:

* **Ubuntu**

    ```
    $ cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
    $ sudo -u postgres ./createdb.sh
    ```

* **MacOS**

    ```
    $ cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
    $ ./createdb.sh
    $ createdb `whoami`
    ```

Connect to the PostgreSQL database and run DB status commands. To export the
settings from `app/explorerconfig.json` to the environment, run `source
app/exportConfig.sh`; this will set `$DATABASE_DATABASE` and related envvars.

* **Ubuntu**

    ```shell
    sudo -u postgres psql -c '\l'
    sudo -u postgres psql $DATABASE_DATABASE -c '\d'
    ```

* **MacOS**

    ```shell
    psql -c '\l'
    psql $DATABASE_DATABASE -c '\d'
    ```

Expected output
```shell
$ sudo -u postgres psql -c '\l'
                                     List of databases
      Name      |        Owner        | Encoding | Collate |  Ctype  |   Access privileges
----------------+---------------------+----------+---------+---------+-----------------------
 fabricexplorer | $DATABASE_USERNAME  | UTF8     | C.UTF-8 | C.UTF-8 |
 postgres       | postgres            | UTF8     | C.UTF-8 | C.UTF-8 |
 template0      | postgres            | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
                |                     |          |         |         | postgres=CTc/postgres
 template1      | postgres            | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
                |                     |          |         |         | postgres=CTc/postgres
(4 rows)

$ sudo -u postgres psql $DATABASE_DATABASE -c '\d'
                   List of relations
 Schema |           Name            |   Type   |       Owner
--------+---------------------------+----------+-------------------
 public | blocks                    | table    | $DATABASE_USERNAME
 public | blocks_id_seq             | sequence | $DATABASE_USERNAME
 public | chaincodes                | table    | $DATABASE_USERNAME
 public | chaincodes_id_seq         | sequence | $DATABASE_USERNAME
 public | channel                   | table    | $DATABASE_USERNAME
 public | channel_id_seq            | sequence | $DATABASE_USERNAME
 public | orderer                   | table    | $DATABASE_USERNAME
 public | orderer_id_seq            | sequence | $DATABASE_USERNAME
 public | peer                      | table    | $DATABASE_USERNAME
 public | peer_id_seq               | sequence | $DATABASE_USERNAME
 public | peer_ref_chaincode        | table    | $DATABASE_USERNAME
 public | peer_ref_chaincode_id_seq | sequence | $DATABASE_USERNAME
 public | peer_ref_channel          | table    | $DATABASE_USERNAME
 public | peer_ref_channel_id_seq   | sequence | $DATABASE_USERNAME
 public | transactions              | table    | $DATABASE_USERNAME
 public | transactions_id_seq       | sequence | $DATABASE_USERNAME
 public | write_lock                | table    | $DATABASE_USERNAME
 public | write_lock_write_lock_seq | sequence | $DATABASE_USERNAME
(18 rows)

```

(On MacOS, expect to see your `` `whoami` `` rather than `postgres`. Entries with
`$DATABASE_USERNAME` will have the valuei of that parameter, whether set as an
environment variable or as a JSON keyval; it will not show the literal string.)

## Build Hyperledger Explorer

**Important:** repeat the below steps after every git pull

From the root of the repository:

- `./main.sh clean`
  * To clean the /node_modules, client/node_modules client/build, client/coverage, app/test/node_modules
   directories
* `./main.sh install`
  * To install, run tests, and build project

Or

```
$ cd blockchain-explorer
$ npm install
$ cd client/
$ npm install
$ npm run build
```

## Run Hyperledger Explorer

### Run Locally in the Same Location

* Modify `app/explorerconfig.json` to update sync settings.

    ```json
    "sync": {
      "type": "local"
    }
    ```

* `npm start`
  * It will have the backend and GUI service up, for as long as the process runs

* `npm run app-stop`
  * It will stop the node server

**Note:** If the Hyperledger Fabric network is deployed on other machines, please define the following environment variable

```
$ DISCOVERY_AS_LOCALHOST=false npm start
```

### Run Standalone in Different Location

* Modify `app/explorerconfig.json` to update sync settings.

    ```json
    "sync": {
      "type": "host"
    }
    ```

* If the Hyperledger Explorer was used previously in your browser, be sure to clear the cache before relaunching

* `./syncstart.sh`
  * It will have the sync node up

* `./syncstop.sh`
  * It will stop the sync node

**Note:** If the Hyperledger Fabric network is deployed on other machines, please define the following environment variable

```
$ DISCOVERY_AS_LOCALHOST=false ./syncstart.sh
```

# Updating Docker image

To build a new version of the Docker image, use `npm run-script docker_build`. This creates a new image, which will become `hyperledger-explorer:latest` (distinct from the canonical images, which are `hyperledger/explorer`, with a `/`). This is a distinct build from the local version used in the Quick Start process. Run this image with `docker-compose down && docker-compose up -d`; both commands are needed.

# Configuration

Please refer [README-CONFIG.md](README-CONFIG.md) for more detail on each configuration.


# Logs

* Please visit the `./logs/console` folder to view the logs relating to the console and `./logs/app` to view the application logs, and visit the `./logs/db` to view the database logs.

# Troubleshooting

Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.

# License

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.
