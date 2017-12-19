# Hyperledger Explorer

Hyperledger Explorer is a simple, powerful, easy-to-use, highly maintainable, open source browser for viewing activity on the underlying blockchain network.

## Directory Structure
```
├── app                    fabric GRPC interface
├── db			   the mysql script and help class
├── explorer_client        Web Ui
├── first-network	Basic fabric network setup
├── listener               websocket listener
├── metrics                metrics about tx count per minute and block count per minute
├── service                the service 
├── socket		   push real time data to front end
├── timer                  Timer to post information periodically  
└── utils                  Various utility scripts 
```


## Requirements


Following are the software dependencies required to install and run hyperledger explorer 
* nodejs 6.9.x (Note that v7.x is not yet supported)
* mysql 5.7 or greater

Hyperledger Explorer works with Hyperledger Fabric 1.0.  Install the following software dependencies to manage fabric network.
* docker 17.06.2-ce [https://www.docker.com/community-edition]
* docker-compose 1.14.0 [https://docs.docker.com/compose/]

## Clone Repository

Clone this repository to get the latest using the following command.
1. `git clone https://github.com/hyperledger/blockchain-explorer.git`
2. `cd blockchain-explorer`

## Database setup
Run the database setup scripts located under `db/fabricexplorer.sql`

`mysql -u<username> -p < db/fabricexplorer.sql`

## Fabric network setup

This repository comes with a sample network configuration to start with

1. `cd first-network`
2. `./bootstrap-1.0.2.sh` - This is going to download the necessary
binaries and hyperledger docker images.
3. `mkdir -p ./channel-artifacts`
4. `./byfn.sh -m generate -c mychannel`
5. `./byfn.sh -m up -c mychannel`

This brings up a 2 org network with channel name `mychannel` .

Alternatively you can setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `config.json` accordingly.

## Running blockchain-explorer

On another terminal, 
1. `cd blockchain-explorer`
2. Modify config.json to update one of the channel 
	* mysql host, username, password details
```json
 "channel": "mychannel",
 "mysql":{
      "host":"127.0.0.1",
      "database":"fabricexplorer",
      "username":"root",
      "passwd":"123456"
   }
```
If you are connecting to a non TLS fabric network, please modify the 
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`
3. `npm install`
4. `./start.sh`

Launch the URL http://localhost:8080 on a browser.

## Screenshots

This is how the blockchain-explorer looks like,

![Blockchain Explorer](https://raw.githubusercontent.com/JeevaSang/blockchainimage/master/explorer1.png)

![Blockchain Explorer](https://raw.githubusercontent.com/JeevaSang/blockchainimage/master/explorer2.png)
 
