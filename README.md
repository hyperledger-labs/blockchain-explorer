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

 Setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `config.json` accordingly. 

## Running blockchain-explorer

On another terminal, 
1. `cd blockchain-explorer`
2. Modify config.json to update network-config
Change "fabric-path" to your fabric network path, example "/home/user1/workspace/fabric-samples" for the following keys: "tls_cacerts", "key", "cert".
Final path for key "tls_cacerts" will be "/home/user1/workspace/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
3. Modify config.json to update one of the channel 
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
If you are connecting to a non TLS fabric peer, please modify the 
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`. Depending on this key, the application decides whether to go TLS or non TLS route.

3. `npm install`
4. `./start.sh`

Launch the URL http://localhost:8080 on a browser.