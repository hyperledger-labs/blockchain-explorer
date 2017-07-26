# fabric explorer

Fabric-explorer is a simple, powerful, easy-to-use, highly maintainable, open source fabric browser. Fabric-explorer can reduce the difficulty of learning and using fabric, so that we can intuitively feel the fabric of the powerful features.

[中文 文档](https://github.com/onechain/fabric-explorer#introduction)

[技术支持](http://www.blockchainbrother.com/articles/fabric-explorer)

## Directory Structure
```
├── app                    fabric GRPC interface
├── artifacts              
├── blockdata              the fabric data struct sample
├── db			   the mysql script and help class
├── explorer_client        Web Ui
├── listener               websocket listener
├── metrics                metrics about tx count per minute and block count per minute
├── service                the service 
├── socket		   push real time data to front end
├── timer                    
└── utils                    
```


## Demo
[See live demo here](http://112.124.115.82:8800/)


## Requirements

* docker 1.12.6
* docker-compose 1.11.2
* golang 1.8
* nodejs 6.9.5
* git
* mysql

## run database script : db/fabricexplorer.sql

```sql


/*
 fabric-explorer mysql database
 http://www.blockchainbtother.com
*/

DROP DATABASE IF EXISTS `fabricexplorer`;

CREATE DATABASE fabricexplorer DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci; 

use  fabricexplorer;


SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------
DROP TABLE IF EXISTS `blocks`;
CREATE TABLE `blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `blocknum` int(11) DEFAULT NULL,
  `datahash` varchar(256) DEFAULT NULL,
  `prehash` varchar(256) DEFAULT NULL,
  `channelname` varchar(128) DEFAULT NULL,
  `txcount` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `block_ind` (`channelname`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='blocks';

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS `chaincodes`;
CREATE TABLE `chaincodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `channelname` varchar(255) DEFAULT NULL,
  `txcount` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Chain codes ';

-- ----------------------------
--  Table structure for `channel`
-- ----------------------------
DROP TABLE IF EXISTS `channel`;
CREATE TABLE `channel` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(64) DEFAULT NULL,
  `blocks` int(11) DEFAULT NULL,
  `trans` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Channel';

-- ----------------------------
--  Table structure for `peer`
-- ----------------------------
DROP TABLE IF EXISTS `peer`;
CREATE TABLE `peer` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `org` int(11) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  `mspid` varchar(64) DEFAULT NULL,
  `requests` varchar(64) DEFAULT NULL,
  `events` varchar(64) DEFAULT NULL,
  `server_hostname` varchar(64) DEFAULT NULL,
  `createdt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS `peer_ref_channel`;
CREATE TABLE `peer_ref_channel` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `peerid` int(11) DEFAULT NULL,
  `channelid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `transaction`
-- ----------------------------
DROP TABLE IF EXISTS `transaction`;
CREATE TABLE `transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `channelname` varchar(64) DEFAULT NULL,
  `blockid` int(11) DEFAULT NULL,
  `txhash` varchar(256) DEFAULT NULL,
  `createdt` datetime DEFAULT NULL,
  `chaincodename` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2823 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `write_lock`
-- ----------------------------
DROP TABLE IF EXISTS `write_lock`;
CREATE TABLE `write_lock` (
  `write_lock` int(1) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`write_lock`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

SET FOREIGN_KEY_CHECKS = 1;
```

## set fabric docker env

1. `git clone https://github.com/onechain/fabric-docker-compose-svt.git`
2. `mv fabric-docker-compose-svt $GOPATH/src/github.com/hyperledger/fabric/examples/`
3. `cd $GOPATH/src/github.com/hyperledger/fabric/examples/fabric-docker-compose-svt`
4. `./download_images.sh`
5. `./start.sh`


## start fabric-explorer

1. `git clone https://github.com/onechain/fabric-explorer.git`
2. `rm -rf ./artifacts/crypto-config/`
3. `cp -r $GOPATH/src/github.com/hyperledger/fabric/examples/fabric-docker-compose-svt/crypto-config ./fabric-explorer/artifacts/crypto-config/`

4. modify config.json,set channel,mysql
```json
 "channelsList": ["mychannel"],
 "mysql":{
      "host":"172.16.10.162",
      "database":"fabricexplorer",
      "username":"root",
      "passwd":"123456"
   }
```

5. modify app/network-config.json 

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

---

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

```sql
/*
 fabric-explorer mysql database
 http://www.blockchainbtother.com
*/

DROP DATABASE IF EXISTS `fabricexplorer`;

CREATE DATABASE fabricexplorer DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci; 

use  fabricexplorer;

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------
DROP TABLE IF EXISTS `blocks`;
CREATE TABLE `blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `blocknum` int(11) DEFAULT NULL,
  `datahash` varchar(256) DEFAULT NULL,
  `prehash` varchar(256) DEFAULT NULL,
  `channelname` varchar(128) DEFAULT NULL,
  `txcount` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `block_ind` (`channelname`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='blocks';

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS `chaincodes`;
CREATE TABLE `chaincodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `channelname` varchar(255) DEFAULT NULL,
  `txcount` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Chain codes ';

-- ----------------------------
--  Table structure for `channel`
-- ----------------------------
DROP TABLE IF EXISTS `channel`;
CREATE TABLE `channel` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(64) DEFAULT NULL,
  `blocks` int(11) DEFAULT NULL,
  `trans` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Channel';

-- ----------------------------
--  Table structure for `peer`
-- ----------------------------
DROP TABLE IF EXISTS `peer`;
CREATE TABLE `peer` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `org` int(11) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  `mspid` varchar(64) DEFAULT NULL,
  `requests` varchar(64) DEFAULT NULL,
  `events` varchar(64) DEFAULT NULL,
  `server_hostname` varchar(64) DEFAULT NULL,
  `createdt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS `peer_ref_channel`;
CREATE TABLE `peer_ref_channel` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `peerid` int(11) DEFAULT NULL,
  `channelid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `transaction`
-- ----------------------------
DROP TABLE IF EXISTS `transaction`;
CREATE TABLE `transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `channelname` varchar(64) DEFAULT NULL,
  `blockid` int(11) DEFAULT NULL,
  `txhash` varchar(256) DEFAULT NULL,
  `createdt` datetime DEFAULT NULL,
  `chaincodename` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2823 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT=' ';

-- ----------------------------
--  Table structure for `write_lock`
-- ----------------------------
DROP TABLE IF EXISTS `write_lock`;
CREATE TABLE `write_lock` (
  `write_lock` int(1) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`write_lock`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

SET FOREIGN_KEY_CHECKS = 1;
```

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
