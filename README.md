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
3. `mkdir -p ./channel_artifacts`
4. `./byfn.sh -m generate -c mychannel`
5. `./byfn.sh -m up -c mychannel`

Alternatively you can setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `network-config.json` accordingly.

This brings up a 2 org network with channel name `mychannel` .

## Running blockchain-explorer

On another terminal, 
1. `cd blockchain-explorer`
2. Modify config.json to update the values for 
	* channels
	* mysql host, username, password details
	* tls 	
```json
 "channelsList": ["mychannel"],
 "enableTls":true, 
 "mysql":{
      "host":"172.16.10.162",
      "database":"fabricexplorer",
      "username":"root",
      "passwd":"123456"
   }
```
3. `npm install`
4. `./start.sh`

Launch the URL http://localhost:8080 on a browser.

## Screenshots

This is how the fabric-explorer looks like,

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp1.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp3.png)

## SIMPLE REST-API

This also provides a simple rest-api to access the following
* Block
* Transaction
* Peer Status
* List of chaincodes deployed

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



- Query to fetch channels

```
http://localhost:8080/apis/channels?peer=peer1

returns:

{"channels":[{"channel_id":"mychannel1"},{"channel_id":"mychannel2"}]}

```

- Query to get BlockCount on a channel

```
http://localhost:8080/apis/channels/:channelname/height

example:

http://localhost:8080/apis/channels/mychannel1/height

returns:

11

```

- Query to fetch all Installed/instantiated chaincodes

```

example:

http://localhost:8080/apis/chaincodes?channel=mychannel1

returns:

[{"name":"mycc","version":"v1","path":"github.com/uniqueKeyValue"}]


```

- Query for Channel Information

```
http://localhost:8080/apis/channels/:channelName?peer=peer1

example:

http://localhost:8080/apis/channels/mychannel1?peer=peer1

returns:

{"height":{"low":11,"high":0,"unsigned":true},"currentBlockHash":{"buffer":{"type":"Buffer","data":[8,11,18,32,90,45,133,231,141,67,36,144,207,89,0,146,16,148,152,87,45,74,92,18,81,15,204,7,46,18,45,19,107,246,6,137,26,32,211,81,65,122,137,193,139,40,222,151,12,146,250,86,9,198,149,213,97,220,41,202,26,167,187,251,114,17,101,146,45,76]},"offset":4,"markedOffset":-1,"limit":36,"littleEndian":true,"noAssert":false},"previousBlockHash":{"buffer":{"type":"Buffer","data":[8,11,18,32,90,45,133,231,141,67,36,144,207,89,0,146,16,148,152,87,45,74,92,18,81,15,204,7,46,18,45,19,107,246,6,137,26,32,211,81,65,122,137,193,139,40,222,151,12,146,250,86,9,198,149,213,97,220,41,202,26,167,187,251,114,17,101,146,45,76]},"offset":38,"markedOffset":-1,"limit":70,"littleEndian":true,"noAssert":false}}

```

- Query Get Block by Hash


```
http://localhost:8080/apis/channels/:channelName/blocks?peer=peer1&hash=blockHash

example:

http://localhost:8080/apis/channels/mychannel1/blocks?peer=peer1&hash=17edcc4ab8dbac1bca83d4108a24cb7708f1305c09df0908e90399df665a462d

returns:

{"header":{"number":{"low":0,"high":0,"unsigned":true},"previous_hash":"","data_hash":"0d37b6e459b5b1ab536488b459743497ca41756877395fd83cee1a247a18a7a6"},"data":{"data":[{"signature":{"type":"Buffer","data":[48,69,2,33,0,235,193,198,202,68,232,94,94,84,187,198,24,165,76,64,5,230,187,54,42,13,208,49,180,44,92,45,193,141,59,75,252,2,32,66,9,142,72,25,163,108,1,117,225,129,218,88,31,112,58,114,252,147,142,233,138,233,59,40,202,230,49,31,245,61,125]},"payload":{"header":{"channel_header":{"type":"CONFIG","version":1,"timestamp":"Thu Sep 28 2017 10:11:05 GMT+0800 (CST)","channel_id":"mychannel1","tx_id":"","epoch":0,"extension":{"type":"Buffer","data":[]}},"signature_header":{"creator":{"Mspid":"OrdererMSP","IdBytes":"-----BEGIN -----\nMIICDDCCAbOgAwIBAgIQOHE/ondSQMSlUNNQazSIXTAKBggqhkjOPQQDAjBpMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEUMBIGA1UEChMLZXhhbXBsZS5jb20xFzAVBgNVBAMTDmNhLmV4YW1w\nbGUuY29tMB4XDTE3MDcxNTAyMDYzNloXDTI3MDcxMzAyMDYzNlowWTELMAkGA1UE\nBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lz\nY28xHTAbBgNVBAMTFG9yZGVyZXIwLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYI\nKoZIzj0DAQcDQgAEhaQ2UremZlrOMvYberqt4fppOO7pgYHrYou2fafNzk5Rdtp8\nGsP3hDum49p+9jLYzzp5c6zDCaLsjm+Xvl2zDqNNMEswDgYDVR0PAQH/BAQDAgeA\nMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgrlTI/LkISeYsdjEWv9fZyWppSzBu\nr9kNeyV2jlUJkVswCgYIKoZIzj0EAwIDRwAwRAIgQuOrMWolp2iJrCG6R/3jVYRF\nuivJkRQsAkRnel25y6ACIDcxY4zuGR1cHEAIFlbvt3oq83mwIYcTF+mT1+caLkOL\n-----END -----\n"},"nonce":{"type":"Buffer","data":[112,94,14,11,197,72,6,126,254,29,66,47,220,119,125,132,27,139,0,212,3,129,213,76]}}},"data":{"config":{"sequence":{"low":1,"high":0,"unsigned":true},"channel_group":{"version":0,"groups":{"Orderer":{"version":0,"groups":{"OrdererMSP":{"version":0,"groups":{},"values":{"MSP":{"version":0,"mod_policy":"Admins","value":{"type":0,"config":{"name":"OrdererMSP","root_certs":["-----BEGIN CERTIFICATE-----\nMIICLzCCAdagAwIBAgIRAO7tuPK9KmxUdlKSx13kjs8wCgYIKoZIzj0EAwIwaTEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt\ncGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZaMGkxCzAJBgNV\nBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp\nc2NvMRQwEgYDVQQKEwtleGFtcGxlLmNvbTEXMBUGA1UEAxMOY2EuZXhhbXBsZS5j\nb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARrwQalsz34OGRcWl2d6QaJt7YQ\nq+113l0rzqY6/eMNKkFU5mKuKlhEFlPje0uxEwCqBaN8qt+ErwoEGC+2ajWGo18w\nXTAOBgNVHQ8BAf8EBAMCAaYwDwYDVR0lBAgwBgYEVR0lADAPBgNVHRMBAf8EBTAD\nAQH/MCkGA1UdDgQiBCCuVMj8uQhJ5ix2MRa/19nJamlLMG6v2Q17JXaOVQmRWzAK\nBggqhkjOPQQDAgNHADBEAiBzzvzAhn8ZHHPFEeSRklweZATDzVSSg2UoRHmRzrfB\nyQIgC+y8O4EzLxvst/RWo2kKzCKaUULX3x8V4JitSjkfkyA=\n-----END CERTIFICATE-----\n"],"intermediate_certs":[],"admins":["-----BEGIN CERTIFICATE-----\nMIICCTCCAbCgAwIBAgIQO9MVJymGxa51LJnAD/+WCTAKBggqhkjOPQQDAjBpMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEUMBIGA1UEChMLZXhhbXBsZS5jb20xFzAVBgNVBAMTDmNhLmV4YW1w\nbGUuY29tMB4XDTE3MDcxNTAyMDYzNloXDTI3MDcxMzAyMDYzNlowVjELMAkGA1UE\nBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lz\nY28xGjAYBgNVBAMMEUFkbWluQGV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZI\nzj0DAQcDQgAED098sJ5MWt+G+iTYndqxVJNYcc/9tQJNrGo6WT3y72GDKRvrjOJO\ngj9LESvfRkhR2DLUjrcOAWuxUFkQVl2Y8aNNMEswDgYDVR0PAQH/BAQDAgeAMAwG\nA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgrlTI/LkISeYsdjEWv9fZyWppSzBur9kN\neyV2jlUJkVswCgYIKoZIzj0EAwIDRwAwRAIgNjM48iYrYHjLb4HtiWZSqJCSyip4\nQOINhia7Ox+sOkkCIBC7GSCNHUwjXF2W39ct+URK4w+6zpTXK17OoCPijCT6\n-----END CERTIFICATE-----\n"],"revocation_list":[],"signing_identity":null,"organizational_unit_identifiers":[]}}}},"policies":{"Admins":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"OrdererMSP","Role":"ADMIN"}]}}},"Readers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"OrdererMSP","Role":"MEMBER"}]}}},"Writers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"OrdererMSP","Role":"MEMBER"}]}}}},"mod_policy":"Admins"}},"values":{"BatchSize":{"version":0,"mod_policy":"Admins","value":{"max_message_count":3,"absolute_max_bytes":102760448,"preferred_max_bytes":524288}},"BatchTimeout":{"version":0,"mod_policy":"Admins","value":{"timeout":"2s"}},"ChannelRestrictions":{"version":0,"mod_policy":"Admins","value":{"max_count":{"low":0,"high":0,"unsigned":true}}},"KafkaBrokers":{"version":0,"mod_policy":"Admins","value":{}},"ConsensusType":{"version":0,"mod_policy":"Admins","value":{"type":"kafka"}}},"policies":{"Readers":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Readers","rule":"ANY"}}},"Writers":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Writers","rule":"ANY"}}},"Admins":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Admins","rule":"MAJORITY"}}},"BlockValidation":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Writers","rule":"ANY"}}}},"mod_policy":"Admins"},"Application":{"version":1,"groups":{"Org1MSP":{"version":0,"groups":{},"values":{"MSP":{"version":0,"mod_policy":"Admins","value":{"type":0,"config":{"name":"Org1MSP","root_certs":["-----BEGIN CERTIFICATE-----\nMIICQzCCAeqgAwIBAgIRAMTkVne1BkUA+xrG1IucKzwwCgYIKoZIzj0EAwIwczEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMTcwNzE1MDIwNjM2WhcNMjcwNzEzMDIwNjM2\nWjBzMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\nU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UE\nAxMTY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBAKOsvBuwa68x3TYUlc915mlX1YkIjul1eiluBmwjKoEPNv9huuW81u14jqBiiyO\nfnssCPqIh81IPbiw7hN5GR+jXzBdMA4GA1UdDwEB/wQEAwIBpjAPBgNVHSUECDAG\nBgRVHSUAMA8GA1UdEwEB/wQFMAMBAf8wKQYDVR0OBCIEIHuoXLT6fErJvkxl4466\nzHfapm6CqPobUFL2jLQBLNY5MAoGCCqGSM49BAMCA0cAMEQCIG8p1VWO64Alyn/X\n1Sg29ub89B9qBpsh0r8aVdwrPD7AAiBFAMVmNlVW/4ez2qAFSLRDlv9WLEFtD7BF\nUis5K9ze1Q==\n-----END CERTIFICATE-----\n"],"intermediate_certs":[],"admins":["-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"],"revocation_list":[],"signing_identity":null,"organizational_unit_identifiers":[]}}}},"policies":{"Writers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org1MSP","Role":"MEMBER"}]}}},"Admins":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org1MSP","Role":"ADMIN"}]}}},"Readers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org1MSP","Role":"MEMBER"}]}}}},"mod_policy":"Admins"},"Org2MSP":{"version":0,"groups":{},"values":{"MSP":{"version":0,"mod_policy":"Admins","value":{"type":0,"config":{"name":"Org2MSP","root_certs":["-----BEGIN CERTIFICATE-----\nMIICRDCCAeqgAwIBAgIRAOAK6UNPLpdERhKmnBd05RYwCgYIKoZIzj0EAwIwczEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzIuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzIuZXhhbXBsZS5jb20wHhcNMTcwNzE1MDIwNjM2WhcNMjcwNzEzMDIwNjM2\nWjBzMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\nU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMi5leGFtcGxlLmNvbTEcMBoGA1UE\nAxMTY2Eub3JnMi5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBGiYV2PdPnvwA0EYnm2Elhfq12yF2+le6QsJR+S7wYKiE/Uaa3LF3w7GQ2DFltqt\nS3lZVo8dmeWUqehwkOfdew6jXzBdMA4GA1UdDwEB/wQEAwIBpjAPBgNVHSUECDAG\nBgRVHSUAMA8GA1UdEwEB/wQFMAMBAf8wKQYDVR0OBCIEIEGIqeaKQHLFUoz4lbUG\nlBL8Z5gRKToptVGcAgnWIW4bMAoGCCqGSM49BAMCA0gAMEUCIQDruLry79r1Vfrg\nnrXaBNBUFM8rgb9YCTlEkFpr2z41bgIgVcs7ZZE1H2m+mv7GYIONKlq8tFc4fu45\nd/EQIdCoCPU=\n-----END CERTIFICATE-----\n"],"intermediate_certs":[],"admins":["-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQQE26BPVgQfIchcdcirObmjAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMi5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMi5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcyLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEP9miyVrFxkYxDSeGcxnj5SWYdzMRorw7\nN2Gagvm6yUBfEszIFJQZvarC1pIIFqpC8b8q+ZI4zLWn1HYGcvYj4KNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgQYip5opAcsVS\njPiVtQaUEvxnmBEpOim1UZwCCdYhbhswCgYIKoZIzj0EAwIDRwAwRAIgGC37d8De\nx9fubLTwf07GzEd4ds5V643MW1lD3V6wcLMCIDjpr+mIl/4qPZTui6QEb9GHwd2D\nfxsBBk1JfiImxMTj\n-----END CERTIFICATE-----\n"],"revocation_list":[],"signing_identity":null,"organizational_unit_identifiers":[]}}}},"policies":{"Admins":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org2MSP","Role":"ADMIN"}]}}},"Readers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org2MSP","Role":"MEMBER"}]}}},"Writers":{"version":0,"mod_policy":"Admins","policy":{"type":"SIGNATURE","policy":{"version":0,"policy":{"Type":"n_out_of","n_out_of":{"N":1,"policies":[{"Type":"signed_by","signed_by":0}]}},"identities":[{"principal_classification":0,"msp_identifier":"Org2MSP","Role":"MEMBER"}]}}}},"mod_policy":"Admins"}},"values":{},"policies":{"Admins":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Admins","rule":"MAJORITY"}}},"Writers":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Writers","rule":"ANY"}}},"Readers":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Readers","rule":"ANY"}}}},"mod_policy":"Admins"}},"values":{"BlockDataHashingStructure":{"version":0,"mod_policy":"Admins","value":{"width":4294967295}},"OrdererAddresses":{"version":0,"mod_policy":"/Channel/Orderer/Admins","value":{"addresses":["orderer0.example.com:7050","orderer1.example.com:7050","orderer2.example.com:7050"]}},"Consortium":{"version":0,"mod_policy":"","value":{"name":"SampleConsortium"}},"HashingAlgorithm":{"version":0,"mod_policy":"Admins","value":{"name":"SHA256"}}},"policies":{"Admins":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Admins","rule":"MAJORITY"}}},"Readers":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Readers","rule":"ANY"}}},"Writers":{"version":0,"mod_policy":"Admins","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Writers","rule":"ANY"}}}},"mod_policy":""}},"last_update":{"payload":{"header":{"channel_header":{"type":"CONFIG_UPDATE","version":2,"timestamp":"Thu Sep 28 2017 10:11:05 GMT+0800 (CST)","channel_id":"mychannel1","tx_id":"9276c884f36cbd751acc38ca21219c741b936702246c2bdb13821d0199ae5193","epoch":0,"extension":{"type":"Buffer","data":[]}},"signature_header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[43,139,71,235,5,13,93,235,212,213,247,31,150,236,178,78,32,5,207,37,120,72,141,63]}}},"data":{"config_update":{"channel_id":"mychannel1","read_set":{"version":0,"groups":{"Application":{"version":0,"groups":{"Org1MSP":{"version":0,"groups":{},"values":{},"policies":{},"mod_policy":""},"Org2MSP":{"version":0,"groups":{},"values":{},"policies":{},"mod_policy":""}},"values":{},"policies":{},"mod_policy":""}},"values":{"Consortium":{"version":0,"mod_policy":"","value":{"name":"SampleConsortium"}}},"policies":{},"mod_policy":""},"write_set":{"version":0,"groups":{"Application":{"version":1,"groups":{"Org1MSP":{"version":0,"groups":{},"values":{},"policies":{},"mod_policy":""},"Org2MSP":{"version":0,"groups":{},"values":{},"policies":{},"mod_policy":""}},"values":{},"policies":{"Admins":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Admins","rule":"MAJORITY"}}},"Writers":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Writers","rule":"ANY"}}},"Readers":{"version":0,"mod_policy":"","policy":{"type":"IMPLICIT_META","policy":{"sub_policy":"Readers","rule":"ANY"}}}},"mod_policy":"Admins"}},"values":{"Consortium":{"version":0,"mod_policy":"","value":{"name":"SampleConsortium"}}},"policies":{},"mod_policy":""}},"signatures":[{"signature_header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[22,72,248,96,183,237,7,68,93,154,2,218,248,1,10,72,92,24,175,210,127,226,60,255]}},"sigature":{"type":"Buffer","data":[48,67,2,32,76,141,129,192,143,172,36,250,136,141,92,185,150,174,60,106,161,60,194,82,63,190,130,225,187,211,196,74,172,222,7,181,2,31,104,149,126,161,206,128,183,254,57,136,143,189,93,217,140,188,221,169,220,102,234,154,223,8,132,60,85,149,152,21,192]}}]}},"signature":{"type":"Buffer","data":[48,69,2,33,0,146,151,131,117,5,81,236,2,113,198,126,10,4,91,110,90,89,12,245,161,219,154,222,102,194,47,98,6,141,88,177,110,2,32,114,169,151,5,216,117,124,89,52,10,76,238,177,136,201,71,203,162,140,198,64,72,43,159,111,155,224,84,48,145,214,197]}}}}}]},"metadata":{"metadata":[{"value":"","signatures":[]},{"value":{"index":{"low":0,"high":0,"unsigned":true}},"signatures":[]},[]]}}

```


- Query Get Transaction by Transaction ID

```

http://localhost:8080/apis/channels/:channeName/transactions/:txid?peer=peer1

example:

http://localhost:8080/apis/channels/mychannel1/transactions/a19085e35ecb78a83cd2ae6762ae46c0924c765e16d6e5afc51492b522e0ceca?peer=peer1

returns:

{"validationCode":0,"transactionEnvelope":{"signature":{"type":"Buffer","data":[48,69,2,33,0,149,175,192,18,254,216,10,188,108,248,48,93,94,245,76,116,24,110,82,229,117,109,116,114,63,62,73,110,82,242,11,121,2,32,24,221,131,22,192,165,150,133,71,69,13,163,170,41,169,129,17,79,150,20,30,231,45,97,243,253,174,195,166,56,235,227]},"payload":{"header":{"channel_header":{"type":"ENDORSER_TRANSACTION","version":3,"timestamp":"Thu Sep 28 2017 10:11:26 GMT+0800 (CST)","channel_id":"mychannel1","tx_id":"a19085e35ecb78a83cd2ae6762ae46c0924c765e16d6e5afc51492b522e0ceca","epoch":0,"extension":{"type":"Buffer","data":[18,6,18,4,108,115,99,99]}},"signature_header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[1,179,210,163,179,35,107,187,114,229,11,173,206,227,107,62,86,88,80,58,62,145,165,145]}}},"data":{"actions":[{"header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[1,179,210,163,179,35,107,187,114,229,11,173,206,227,107,62,86,88,80,58,62,145,165,145]}},"payload":{"chaincode_proposal_payload":{"input":{"type":"Buffer","data":[10,122,8,1,18,6,18,4,108,115,99,99,26,110,10,6,100,101,112,108,111,121,10,10,109,121,99,104,97,110,110,101,108,49,10,26,10,24,8,1,18,10,18,4,109,121,99,99,26,2,118,48,26,8,10,4,105,110,105,116,10,0,10,60,18,16,18,14,8,1,18,2,8,0,18,2,8,1,18,2,8,2,26,14,18,12,10,10,79,114,100,101,114,101,114,77,83,80,26,11,18,9,10,7,79,114,103,49,77,83,80,26,11,18,9,10,7,79,114,103,50,77,83,80]}},"action":{"proposal_response_payload":{"proposal_hash":"9b247c653f3e92ec6f58dde261dfee3511627a1af2964813825edeb88df3c06f","extension":{"results":{"data_model":0,"ns_rwset":[{"namespace":"lscc","rwset":{"reads":[{"key":"mycc","version":null}],"range_queries_info":[],"writes":[{"key":"mycc","is_delete":false,"value":"\n\u0004mycc\u0012\u0002v0\u001a\u0004escc\"\u0004vscc*<\u0012\u0010\u0012\u000e\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u0012\u0002\b\u0002\u001a\u000e\u0012\f\n\nOrdererMSP\u001a\u000b\u0012\t\n\u0007Org1MSP\u001a\u000b\u0012\t\n\u0007Org2MSP2D\n �jO������Cgt�\u0000S ��\u0012��!�-�\u0001u6���\u0012 *PI�w�\u000fjL5x6^�E=�)ˡF��\t\u0019\u0015��C5\u00115: \u001a�[$�\u001f�\u0013؉]�R74\u001fGƆ2��+�5.�z��G�B,\u0012\f\u0012\n\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u001a\r\u0012\u000b\n\u0007Org1MSP\u0010\u0001\u001a\r\u0012\u000b\n\u0007Org2MSP\u0010\u0001"}]}}]},"events":{"chaincode_id":"","tx_id":"","event_name":"","payload":{"type":"Buffer","data":[]}},"response":{"status":200,"message":"","payload":"\n\u0004mycc\u0012\u0002v0\u001a\u0004escc\"\u0004vscc*<\u0012\u0010\u0012\u000e\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u0012\u0002\b\u0002\u001a\u000e\u0012\f\n\nOrdererMSP\u001a\u000b\u0012\t\n\u0007Org1MSP\u001a\u000b\u0012\t\n\u0007Org2MSP2D\n �jO������Cgt�\u0000S ��\u0012��!�-�\u0001u6���\u0012 *PI�w�\u000fjL5x6^�E=�)ˡF��\t\u0019\u0015��C5\u00115: \u001a�[$�\u001f�\u0013؉]�R74\u001fGƆ2��+�5.�z��G�B,\u0012\f\u0012\n\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u001a\r\u0012\u000b\n\u0007Org1MSP\u0010\u0001\u001a\r\u0012\u000b\n\u0007Org2MSP\u0010\u0001"}}},"endorsements":[{"endorser":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN -----\nMIICGDCCAb+gAwIBAgIQXORLj+M+bZmvRJoszFNTLzAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMC5vcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqx9TvzAVDCYkcI7PolGydUptHN4s59n5\nPlWCCYNLkLvfHZRSYlZV+ZtEJTJuVsS+0cFe9mK4no8DsESvKy3fFqNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgdHMM2mnd\nCYQg7tNXlxCeeCXimerCBZI2c0Jq79Pi3X8CIA5AN0pyIuDnl05c7sugzpYtMoKq\nZPNHf5DiHsG9Ddx0\n-----END -----\n"},"signature":{"type":"Buffer","data":[48,68,2,32,44,155,59,238,100,189,209,112,135,105,125,202,163,152,90,6,77,93,239,73,128,22,42,225,191,212,145,34,216,178,184,18,2,32,122,82,29,77,119,60,169,203,52,136,35,193,44,155,134,75,107,69,32,137,251,170,97,0,88,236,253,78,153,184,246,22]}},{"endorser":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN -----\nMIICGDCCAb+gAwIBAgIQR6SpGhVy3iGFbuqxW/UmgjAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMS5vcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8lS4rakieycXrWvkqpitrL1BOtTpB8d+\nrIQd1Dq0851vTwFtKOGM+/AyZj3YFmPquLyjh+Y/f8gEOhl2ukbxaKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgdNm6ogr4\nh5IOGqgxvxKQIgcVotBWSE22ienKZMxaMsACICH02+7VWNGoegJIxh3uSbSxczUd\nkIq+MzhhkpPKGly7\n-----END -----\n"},"signature":{"type":"Buffer","data":[48,69,2,33,0,175,157,205,24,107,173,2,11,115,93,222,233,81,233,62,154,58,80,174,140,163,75,69,134,90,10,6,208,190,197,97,64,2,32,85,188,87,232,107,88,209,230,47,166,33,55,144,122,127,96,254,233,232,126,135,142,197,32,244,185,161,153,55,158,145,53]}}]}}}]}}}}

```


-  Query Get Block by BlockNumber

```
http://localhost:8080/apis/channels/:channelName/blocks/:blockNumber?peer=peer1

example:

http://localhost:8080/apis/channels/mychannel1/blocks/1?peer=peer1

returns:

{"header":{"number":{"low":1,"high":0,"unsigned":true},"previous_hash":"17edcc4ab8dbac1bca83d4108a24cb7708f1305c09df0908e90399df665a462d","data_hash":"5d0ce069c0d1832a1860459293573d1b16fda1504a94718840e6a4531f2933c4"},"data":{"data":[{"signature":{"type":"Buffer","data":[48,69,2,33,0,149,175,192,18,254,216,10,188,108,248,48,93,94,245,76,116,24,110,82,229,117,109,116,114,63,62,73,110,82,242,11,121,2,32,24,221,131,22,192,165,150,133,71,69,13,163,170,41,169,129,17,79,150,20,30,231,45,97,243,253,174,195,166,56,235,227]},"payload":{"header":{"channel_header":{"type":"ENDORSER_TRANSACTION","version":3,"timestamp":"Thu Sep 28 2017 10:11:26 GMT+0800 (CST)","channel_id":"mychannel1","tx_id":"a19085e35ecb78a83cd2ae6762ae46c0924c765e16d6e5afc51492b522e0ceca","epoch":0,"extension":{"type":"Buffer","data":[18,6,18,4,108,115,99,99]}},"signature_header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[1,179,210,163,179,35,107,187,114,229,11,173,206,227,107,62,86,88,80,58,62,145,165,145]}}},"data":{"actions":[{"header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\nMIICGDCCAb+gAwIBAgIQcSoGCOGOr4YBmSoZf3+xKDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9ShZ73kVS0lIvaRV7eLhZaokkD1WAJ9i\n/A7Q+Wo4EmVjFE5Q+zxQ8XdYf+c3Qb/oujc4DBWoBfyu5h0CGmJ4TKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgAynT6AFB\n3cyecXoI8jpT1PYLxLlQDYtIKzLy9wLwpgoCICxT8Zkq2F8phZ7LDnpKmqELIAsW\nPFzJ3ihODDc6GqCk\n-----END CERTIFICATE-----\n"},"nonce":{"type":"Buffer","data":[1,179,210,163,179,35,107,187,114,229,11,173,206,227,107,62,86,88,80,58,62,145,165,145]}},"payload":{"chaincode_proposal_payload":{"input":{"type":"Buffer","data":[10,122,8,1,18,6,18,4,108,115,99,99,26,110,10,6,100,101,112,108,111,121,10,10,109,121,99,104,97,110,110,101,108,49,10,26,10,24,8,1,18,10,18,4,109,121,99,99,26,2,118,48,26,8,10,4,105,110,105,116,10,0,10,60,18,16,18,14,8,1,18,2,8,0,18,2,8,1,18,2,8,2,26,14,18,12,10,10,79,114,100,101,114,101,114,77,83,80,26,11,18,9,10,7,79,114,103,49,77,83,80,26,11,18,9,10,7,79,114,103,50,77,83,80]}},"action":{"proposal_response_payload":{"proposal_hash":"9b247c653f3e92ec6f58dde261dfee3511627a1af2964813825edeb88df3c06f","extension":{"results":{"data_model":0,"ns_rwset":[{"namespace":"lscc","rwset":{"reads":[{"key":"mycc","version":null}],"range_queries_info":[],"writes":[{"key":"mycc","is_delete":false,"value":"\n\u0004mycc\u0012\u0002v0\u001a\u0004escc\"\u0004vscc*<\u0012\u0010\u0012\u000e\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u0012\u0002\b\u0002\u001a\u000e\u0012\f\n\nOrdererMSP\u001a\u000b\u0012\t\n\u0007Org1MSP\u001a\u000b\u0012\t\n\u0007Org2MSP2D\n �jO������Cgt�\u0000S ��\u0012��!�-�\u0001u6���\u0012 *PI�w�\u000fjL5x6^�E=�)ˡF��\t\u0019\u0015��C5\u00115: \u001a�[$�\u001f�\u0013؉]�R74\u001fGƆ2��+�5.�z��G�B,\u0012\f\u0012\n\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u001a\r\u0012\u000b\n\u0007Org1MSP\u0010\u0001\u001a\r\u0012\u000b\n\u0007Org2MSP\u0010\u0001"}]}}]},"events":{"chaincode_id":"","tx_id":"","event_name":"","payload":{"type":"Buffer","data":[]}},"response":{"status":200,"message":"","payload":"\n\u0004mycc\u0012\u0002v0\u001a\u0004escc\"\u0004vscc*<\u0012\u0010\u0012\u000e\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u0012\u0002\b\u0002\u001a\u000e\u0012\f\n\nOrdererMSP\u001a\u000b\u0012\t\n\u0007Org1MSP\u001a\u000b\u0012\t\n\u0007Org2MSP2D\n �jO������Cgt�\u0000S ��\u0012��!�-�\u0001u6���\u0012 *PI�w�\u000fjL5x6^�E=�)ˡF��\t\u0019\u0015��C5\u00115: \u001a�[$�\u001f�\u0013؉]�R74\u001fGƆ2��+�5.�z��G�B,\u0012\f\u0012\n\b\u0001\u0012\u0002\b\u0000\u0012\u0002\b\u0001\u001a\r\u0012\u000b\n\u0007Org1MSP\u0010\u0001\u001a\r\u0012\u000b\n\u0007Org2MSP\u0010\u0001"}}},"endorsements":[{"endorser":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN -----\nMIICGDCCAb+gAwIBAgIQXORLj+M+bZmvRJoszFNTLzAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMC5vcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqx9TvzAVDCYkcI7PolGydUptHN4s59n5\nPlWCCYNLkLvfHZRSYlZV+ZtEJTJuVsS+0cFe9mK4no8DsESvKy3fFqNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgdHMM2mnd\nCYQg7tNXlxCeeCXimerCBZI2c0Jq79Pi3X8CIA5AN0pyIuDnl05c7sugzpYtMoKq\nZPNHf5DiHsG9Ddx0\n-----END -----\n"},"signature":{"type":"Buffer","data":[48,68,2,32,44,155,59,238,100,189,209,112,135,105,125,202,163,152,90,6,77,93,239,73,128,22,42,225,191,212,145,34,216,178,184,18,2,32,122,82,29,77,119,60,169,203,52,136,35,193,44,155,134,75,107,69,32,137,251,170,97,0,88,236,253,78,153,184,246,22]}},{"endorser":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN -----\nMIICGDCCAb+gAwIBAgIQR6SpGhVy3iGFbuqxW/UmgjAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZa\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMS5vcmcxLmV4YW1wbGUuY29tMFkw\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8lS4rakieycXrWvkqpitrL1BOtTpB8d+\nrIQd1Dq0851vTwFtKOGM+/AyZj3YFmPquLyjh+Y/f8gEOhl2ukbxaKNNMEswDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAge6hctPp8Ssm+\nTGXjjrrMd9qmboKo+htQUvaMtAEs1jkwCgYIKoZIzj0EAwIDRwAwRAIgdNm6ogr4\nh5IOGqgxvxKQIgcVotBWSE22ienKZMxaMsACICH02+7VWNGoegJIxh3uSbSxczUd\nkIq+MzhhkpPKGly7\n-----END -----\n"},"signature":{"type":"Buffer","data":[48,69,2,33,0,175,157,205,24,107,173,2,11,115,93,222,233,81,233,62,154,58,80,174,140,163,75,69,134,90,10,6,208,190,197,97,64,2,32,85,188,87,232,107,88,209,230,47,166,33,55,144,122,127,96,254,233,232,126,135,142,197,32,244,185,161,153,55,158,145,53]}}]}}}]}}}]},"metadata":{"metadata":[{"value":"","signatures":[{"signature_header":{"creator":{"Mspid":"OrdererMSP","IdBytes":"-----BEGIN -----\nMIICDjCCAbSgAwIBAgIRAL3LhCHP9JqZHZZ7b9ySDv4wCgYIKoZIzj0EAwIwaTEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt\ncGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZaMFkxCzAJBgNV\nBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp\nc2NvMR0wGwYDVQQDExRvcmRlcmVyMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEG\nCCqGSM49AwEHA0IABJ03AFAenfTyKuUizftsgDoCSehL8Rq4P1aOZcWB9Vyc++wL\nVtLLRwY6KxsVXjWxWulB0ZTtB6eo87YZK+NTzrOjTTBLMA4GA1UdDwEB/wQEAwIH\ngDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIK5UyPy5CEnmLHYxFr/X2clqaUsw\nbq/ZDXsldo5VCZFbMAoGCCqGSM49BAMCA0gAMEUCIQDJTrQshJZisDFc6P8dQk+6\n1g/mMk9Ca5O7NCtRkZVk2gIgN/hhNZUgrn9R2IKUDkTkJYJNXxufE+50XW/73GAU\n+VE=\n-----END -----\n"},"nonce":{"type":"Buffer","data":[221,219,25,77,4,161,236,90,80,83,195,131,16,249,199,42,225,136,101,48,237,211,172,31]}},"signature":{"type":"Buffer","data":[48,69,2,33,0,232,219,57,242,62,100,183,208,105,96,73,9,233,92,96,78,19,242,46,152,93,100,11,227,145,148,90,66,145,188,128,148,2,32,70,185,2,84,194,105,13,44,254,10,154,56,69,114,115,230,70,80,182,235,30,204,220,151,250,40,182,196,11,45,104,68]}}]},{"value":{"index":{"low":0,"high":0,"unsigned":true}},"signatures":[{"signature_header":{"creator":{"Mspid":"OrdererMSP","IdBytes":"-----BEGIN -----\nMIICDjCCAbSgAwIBAgIRAL3LhCHP9JqZHZZ7b9ySDv4wCgYIKoZIzj0EAwIwaTEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt\ncGxlLmNvbTAeFw0xNzA3MTUwMjA2MzZaFw0yNzA3MTMwMjA2MzZaMFkxCzAJBgNV\nBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp\nc2NvMR0wGwYDVQQDExRvcmRlcmVyMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEG\nCCqGSM49AwEHA0IABJ03AFAenfTyKuUizftsgDoCSehL8Rq4P1aOZcWB9Vyc++wL\nVtLLRwY6KxsVXjWxWulB0ZTtB6eo87YZK+NTzrOjTTBLMA4GA1UdDwEB/wQEAwIH\ngDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIK5UyPy5CEnmLHYxFr/X2clqaUsw\nbq/ZDXsldo5VCZFbMAoGCCqGSM49BAMCA0gAMEUCIQDJTrQshJZisDFc6P8dQk+6\n1g/mMk9Ca5O7NCtRkZVk2gIgN/hhNZUgrn9R2IKUDkTkJYJNXxufE+50XW/73GAU\n+VE=\n-----END -----\n"},"nonce":{"type":"Buffer","data":[102,198,192,148,105,195,95,35,227,159,243,46,170,54,139,206,1,178,202,106,101,138,20,40]}},"signature":{"type":"Buffer","data":[48,68,2,32,103,165,68,221,214,173,63,247,51,103,89,78,203,4,88,195,138,195,24,208,187,42,18,130,85,77,113,53,21,236,98,58,2,32,69,74,193,231,116,52,159,94,196,191,0,46,249,45,15,78,164,60,74,242,92,200,149,185,113,241,175,7,13,200,228,142]}}]},[]]}}

```


- Query on chaincode on target peers

```
http://localhost:8080/apis/channels/:channelName/chaincodes/:chaincodeName?peer=peer1&fcn=:fcn&args=:args

example:

http://localhost:8080/apis/channels/mychannel1/chaincodes/mycc?peer=peer1&fcn=get&args=%5B%22org2%22%5D

returns:

putsomerandomvalue-org2

```

- Invoke transaction on chaincode on target peers

```
curl -s -X POST \
	http://localhost:8080/apis/channels/:channelName/chaincodes/:chaincodeName \
	-H "content-type: application/json" \
	-d '{
	"peers": ["127.0.0.1:7051", "127.0.0.1:8051"],
	"fcn":"put",
	"args":["org1","putsomerandomvalue-org1"]
}'

example:

curl -s -X POST \
	http://localhost:8080/apis/channels/mychannel1/chaincodes/mycc \
	-H "content-type: application/json" \
	-d '{
	"peers": ["127.0.0.1:7051", "127.0.0.1:8051"],
	"fcn":"put",
	"args":["org1","putsomerandomvalue-org1"]
}'


returns txid:

423d0a22c07cd577d6f7f32bd02cd7ed5989baa11b08abcc714077a3a7e9eefe

```



- Instantiate chaincode on target peers

```
curl -s -X POST \
  http://localhost:8080/apis/channels/:channelName/chaincodes \
  -H "content-type: application/json" \
  -d '{
	"chaincodeName":"mycc",
	"chaincodeVersion":"v0",
	"functionName":"init",
	"args":[""]
}'

example:

curl -s -X POST \
  http://localhost:8080/apis/channels/mychannel1/chaincodes \
  -H "content-type: application/json" \
  -d '{
	"chaincodeName":"mycc",
	"chaincodeVersion":"v0",
	"functionName":"init",
	"args":[""]
}'

```

- Install chaincode on target peers

```
example:

curl -s -X POST \
  http://localhost:8080/apis/chaincodes \
  -H "content-type: application/json" \
  -d '{
	"peers": ["127.0.0.1:7051","127.0.0.1:8051"],
	"chaincodeName":"mycc",
	"chaincodePath":"github.com/uniqueKeyValue",
	"chaincodeVersion":"v0"
}'

```

- Join Channel

```
curl -s -X POST \
  http://localhost:8080/apis/channels/:channelName/peers \
  -H "content-type: application/json" \
  -d '{
	"peers": ["127.0.0.1:7051","127.0.0.1:8051"]
}'

example:

curl -s -X POST \
  http://localhost:8080/apis/channels/mychannel1/peers \
  -H "content-type: application/json" \
  -d '{
	"peers": ["127.0.0.1:7051","127.0.0.1:8051"]
}'

```

- Create/Update Channel

```

example:

curl -s -X POST \
  http://localhost:8080/apis/channels \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel1",
	"channelConfigPath":"../artifacts/channel/mychannel1.tx",
	"configUpdate":false
}'
```
 
