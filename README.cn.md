# introduction

fabric explorer 是帮助大家学习、管理、监控fabric 的开源项目。

[English document](https://github.com/hyperledger/blockchain-explorer/blob/master/fabric-explorer/README.md)

## Demo
[See live demo here](http://112.124.115.82:8800/)


## Requirements

Please follow the Pre-requisites from [Hyperledger Fabric](http://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html)

Following are the software dependencies required to install and run this fabric-explorer (Please refer to the above link for specific versions)
* docker-ce 17.06.2-ce
* docker-compose 1.14.0
* golang 1.9.x
* nodejs 6.9.x
* git
* mysql 5 or greater

## 执行创建数据库脚本: db/fabricexplorer.sql

Run the database setup scripts located under `db/fabricexplorer.sql`

`mysql -u<username> -p < db/fabricexplorer.sql`


## 设置fabric docker运行环境

1. `git clone https://github.com/onechain/fabric-docker-compose-svt.git`
2. `mv fabric-docker-compose-svt $GOPATH/src/github.com/hyperledger/fabric/examples/`
3. `cd $GOPATH/src/github.com/hyperledger/fabric/examples/fabric-docker-compose-svt`
4. `./download_images.sh`
5. `./start.sh`


## 启动fabric 浏览器

1. `git clone https://github.com/hyperledger/blockchain-explorer.git`
2. `cd blockchain-explorer/fabric-explorer`
3. `mkdir artifacts`
4. `cp -r $GOPATH/src/github.com/hyperledger/fabric/examples/fabric-docker-compose-svt/crypto-config artifacts/crypto-config/`

5. modify config.json,set channel,mysql,tls (if you use tls communication, please set  enableTls  true ,if not set false) 
```json
 "channelsList": ["mychannel"],
 "mysql":{
      "host":"172.16.10.162",
      "database":"fabricexplorer",
      "username":"root",
      "passwd":"123456"
   }
```

5. 修改 app/network-config.json ,配置节点信息

```json
 {
	"network-config": {
		"orderer": [{
			"url": "grpc://112.124.115.82:7050",
			"server-hostname": "orderer0.example.com"
		},{
			"url": "grpc://112.124.115.82:8050",
			"server-hostname": "orderer1.example.com"
		},{
			"url": "grpc://112.124.115.82:9050",
			"server-hostname": "orderer2.example.com"
		}],
		"org1": {
			"name": "peerOrg1",
			"mspid": "Org1MSP",
			"ca": "http://112.124.115.82:7054",
			"peer1": {
				"requests": "grpc://112.124.115.82:7051",
				"events": "grpc://112.124.115.82:7053",
				"server-hostname": "peer0.org1.example.com"
			},
			"peer2": {
				"requests": "grpc://112.124.115.82:8051",
				"events": "grpc://112.124.115.82:8053",
				"server-hostname": "peer1.org1.example.com"
			},
			"admin": {
				"key": "/artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
				"cert": "/artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
			}
		},
		"org2": {
			"name": "peerOrg2",
			"mspid": "Org2MSP",
			"ca": "http://112.124.115.82:8054",
			"peer1": {
				"requests": "grpc://112.124.115.82:9051",
				"events": "grpc://112.124.115.82:9053",
				"server-hostname": "peer0.org2.example.com"
			},
			"peer2": {
				"requests": "grpc://112.124.115.82:10051",
				"events": "grpc://112.124.115.82:10053",
				"server-hostname": "peer1.org2.example.com"
			},
			"admin": {
				"key": "../artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore/5681d5bed252077272137ebbcd141616229862fa4deeedbb9c1cb515e95ed82d_sk",
				"cert": "../artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts/Admin@org2.example.com-cert.pem"
			}
		}
	}
}
```

6. `npm install`
7. `./start.sh`

Launch the URL http://localhost:8080 on a browser.

## 系统截图

这是系统的截图

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp1.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp3.png)


## 简单的 REST-API

I provide a simple rest-api

```
//get block info
curl -X POST  http://localhost:8080/api/block/json -H 'cache-control: no-cache' -H 'content-type: application/json' -d '{
    "number":"${block number}"
}'

//get transcation JOSN
curl -X POST  http://localhost:8080/api/tx/json -H 'cache-control: no-cache' -H 'content-type: application/json' -d '{
    "number":"${ Tx hex }"
}'


//get peer status
curl -X POST  http://localhost:8080/api/status/get -H 'cache-control: no-cache' -H 'content-type: application/json' -d ''

//get chaincode list
curl -X POST  http://localhost:8080/chaincodelist -H 'cache-control: no-cache' -H 'content-type: application/json' -d ''

```