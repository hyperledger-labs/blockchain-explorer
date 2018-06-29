Hyperledger Explorer
=======

Hyperledger Explorer is a simple, powerful, easy-to-use, highly maintainable, open source browser for viewing activity on the underlying blockchain network.

## Table of Contents

- [Directory Structure](#Directory-Structure)
- [Requirements](#Requirements)
- [Clone Repository](#Clone-Repository)
- [Database Setup](#Database-Setup)
- [Fabric Network Setup](#Fabric-Network-Setup)
- [Running Hyperledger Explorer](#Running-Hyperledger-Explorer)
- [Build Hyperledger Explorer](#Build-Hyperledger-Explorer)
- [Swagger Documentation](#Swagger-Documentation)
- [Logs](#Logs)
- [Troubleshooting](#Troubleshooting)
- [License](#License)

## Directory Structure
```
├── app            	 Application backend root
	├── explorer     Explorer configuration, REST API
	├── persistance  Persistence layer
	├── platform     Platforms
		├── fabric   Explorer API (Hyperledger Fabric)
	├── test         Application backend test
├── client         	 Web UI (reactjs)
	├── public       Public folder
	├── src          Front end source code
```
## Requirements

Following are the software dependencies required to install and run hyperledger explorer
* nodejs 8.11.x (Note that v9.x is not yet supported)
* PostgreSQL 9.5 or greater

Hyperledger Explorer works with Hyperledger Fabric 1.1.  Install the following software dependencies to manage fabric network.
* docker 17.06.2-ce [https://www.docker.com/community-edition]
* docker-compose 1.14.0 [https://docs.docker.com/compose/]

## Clone Repository

Clone this repository to get the latest using the following command.

- `git clone https://github.com/hyperledger/blockchain-explorer.git`.
- `cd blockchain-explorer`.

## Database Setup

Connect to PostgreSQL database.

- `sudo -u postgres psql`

Run create database script.

- `\i app/persistance/postgreSQL/db/explorerpg.sql`
- `\i app/persistance/postgreSQL/db/updatepg.sql`

Run db status commands.

- `\l` view created fabricexplorer database
- `\d` view created tables

## Fabric Network Setup

 Setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.

## Running Hyperledger Explorer

On another terminal.

- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your fabric network path,
	example: "/home/user1/workspace/fabric-samples" for the following keys: "tls_cacerts", "key", "cert".
	- Final path for key "tls_cacerts" will be:  "/home/user1/workspace/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt".
- Modify "syncStartDate" to filter data by block timestamp

- Modify config.json to update one of the channel
	- pg host, username, password details.
```json
 "channel": "mychannel",
 "pg": {
		"host": "127.0.0.1",
		"port": "5432",
		"database": "fabricexplorer",
		"username": "hppoc",
		"passwd": "password"
	}
```

If you are connecting to a non TLS fabric peer, please modify the
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`. Depending on this key, the application decides whether to go TLS or non TLS route.

## Build Hyperledger Explorer

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

## Run Hyperledger Explorer

From new terminal.

- `cd blockchain-explorer/`
- `./start.sh`  (it will have the backend up).
- Launch the URL http://localhost:8080 on a browser.
- `./stop.sh`  (it will stop the node server).

- If the blockchain-explorer was used previously in your browser be sure to clear the cache before relaunching.

## Swagger Documentation

- Once the blockchain-explorer has been launched go to http://localhost:8080/api-docs to view the Swagger documentation

## Logs
- Please visit the [./logs/console]() folder to view the logs relating to console and [./logs/app]() to view the application logs and visit the [./logs/db]() to view the database logs.
- Logs rotate for every 7 days.

## Troubleshooting

- Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.

## License

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.