# introduction

fabric explorer 是帮助大家学习、管理、监控fabric 的开源项目。

[English document](https://github.com/onechain/fabric-explorer#Demo)

## Demo
[See live demo here](http://112.124.115.82:8800/)


## Requirements

* docker 1.12.6
* docker-compose 1.11.2
* golang 1.8
* nodejs 6.9.5
* git
* mysql

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

1. `git clone https://github.com/onechain/fabric-explorer.git`
2. `rm -rf ./artifacts/crypto-config/`
3. `cp -r $GOPATH/src/github.com/hyperledger/fabric/examples/fabric-docker-compose-svt/crypto-config ./fabric-explorer/artifacts/crypto-config/`
4. 修改config.json,配置channel,mysql
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
