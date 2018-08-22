Hyperledger Explorer
=======

Hyperledger Explorer is a simple, powerful, easy-to-use, highly maintainable, open source browser for viewing activity on the underlying blockchain network. Users have the ability to configure & build Hyperledger Explorer natively on macOS and Ubuntu.

## Table of Contents

- [Release Notes](#Release-Notes)
- [Directory Structure](#Directory-Structure)
- [Requirements](#Requirements)
- [Clone Repository](#Clone-Repository)
- [Database Setup](#Database-Setup)
- [Fabric Network Setup](#Fabric-Network-Setup)
- [Fabric Configure Hyperledger Explorer](#Fabric-Configure-Hyperledger-Explorer)
- [Composer Configure Hyperledger Explorer](#Composer-Configure-Hyperledger-Explorer)
- [Cello Configure Hyperledger Explorer](#Cello-Configure-Hyperledger-Explorer)
- [Build Hyperledger Explorer](#Build-Hyperledger-Explorer)
- [Run Hyperledger Explorer](#Run-Hyperledger-Explorer)
- [Hyperledger Explorer Swagger](#Hyperledger-Explorer-Swagger)
- [Logs](#Logs)
- [Troubleshooting](#Troubleshooting)
- [License](#License)


<a name="Release-Notes"/>

## Release Notes

- [Release Notes](release_notes/v0.3.4.md)


<a name="Directory-Structure"/>

## Directory Structure
```
├── app            	 Application backend root
	├── explorer     Explorer configuration, REST API
	├── persistence  Persistence layer
	├── platform     Platforms
		├── fabric   Explorer API (Hyperledger Fabric)
	├── test         Application backend test
├── client         	 Web UI
	├── public       Assets
	├── src          Front end source code
		├── components		React framework
		├── services	  	Request library for API calls
		├── state		Redux framework
		├── static       	Custom and Assets
```
<a name="Requirements"/>

## Requirements

Following are the software dependencies required to install and run hyperledger explorer
* nodejs 8.11.x (Note that v9.x is not yet supported)
* PostgreSQL 9.5 or greater
* Jq [https://stedolan.github.io/jq/]

Hyperledger Explorer works with Hyperledger Fabric 1.1.  Install the following software dependencies to manage fabric network.
* docker 17.06.2-ce [https://www.docker.com/community-edition]
* docker-compose 1.14.0 [https://docs.docker.com/compose/]

<a name="Clone-Repository"/>

## Clone Repository

Clone this repository to get the latest using the following command.

- `git clone https://github.com/hyperledger/blockchain-explorer.git`.
- `cd blockchain-explorer`.

<a name="Database-Setup"/>

## Database Setup

- `cd blockchain-explorer/app/persistence/postgreSQL/db`
- Modify pgconfig.json to update postgresql properties
	- pg host, port, database, username, password details.
```json
 "pg": {
		"host": "127.0.0.1",
		"port": "5432",
		"database": "fabricexplorer",
		"username": "hppoc",
		"passwd": "password"
	}
```

**Important repeat after every git pull
Run create database script.

- `cd blockchain-explorer/app/persistence/postgreSQL/db`
- `./createdb.sh`

Run db status commands.
Connect to PostgreSQL database.

#### Ubuntu

- `sudo -u postgres psql`

#### macOS

 - `psql postgres`

- `\l` view created fabricexplorer database
- `\d` view created tables

<a name="Fabric-Network-Setup"/>

## Fabric Network Setup

 Setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.

<a name="Fabric-Configure-Hyperledger-Explorer"/>

## Fabric Configure Hyperledger Explorer

On another terminal.

- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your fabric network path,
	example: "/home/user1/workspace/fabric-samples" for the following keys: "tls_cacerts", "key", "cert".
	- Final path for key "tls_cacerts" will be:  "/home/user1/workspace/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt".
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

 **or**

## Hyperledger Composer Setup

 Setup your own network using Composer [Build your network](https://hyperledger.github.io/composer/latest/installing/development-tools) from Hyperledger Composer. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.

<a name="Composer-Configure-Hyperledger-Explorer"/>

## Composer Configure Hyperledger Explorer

On another terminal.

- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your composer network path,
	- Configure the Hyperledger composer based on this link [CONFIG-COMPOSER-HLEXPLORER.md](CONFIG-COMPOSER-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify the
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`. Depending on this key, the application decides whether to go TLS or non TLS route.

**or**

## Hyperledger Cello Setup

 Setup your fabric network using Cello [Build your network](https://cello.readthedocs.io/en/latest/setup/) from Hyperledger Cello. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.

<a name="Cello-Configure-Hyperledger-Explorer"/>

## Cello Configure Hyperledger Explorer

On another terminal.

- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your cello network path,
	- Configure the Hyperledger cello based on this link [CONFIG-CELLO-HLEXPLORER.md](CONFIG-CELLO-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify the
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`. Depending on this key, the application decides whether to go TLS or non TLS route.

<a name="Build-Hyperledger-Explorer"/>

## Build Hyperledger Explorer
**Important repeat after every git pull

On another terminal.

- `cd blockchain-explorer`
- `npm install`
- `cd blockchain-explorer/app/test`
- `npm install`
- `npm run test`
- `cd client/`
- `npm install`
- `npm test -- -u --coverage`
- `npm run build`

<a name="Run-Hyperledger-Explorer"/>

## Run Hyperledger Explorer

From new terminal.

- `cd blockchain-explorer/`
- `./start.sh`  (it will have the backend up).
- Launch the URL http://localhost:8080 on a browser.
- `./stop.sh`  (it will stop the node server).

- If the Hyperledger Explorer was used previously in your browser be sure to clear the cache before relaunching.

<a name="Hyperledger-Explorer-Swagger"/>

## Hyperledger Explorer Swagger

- Once the Hyperledger Explorer has been launched go to http://localhost:8080/api-docs to view the Rust API description

<a name="Logs"/>

## Logs
- Please visit the [./logs/console]() folder to view the logs relating to console and [./logs/app]() to view the application logs and visit the [./logs/db]() to view the database logs.
- Logs rotate for every 7 days.

<a name="Troubleshooting"/>

## Troubleshooting

- Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.

<a name="License"/>

## License

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.

