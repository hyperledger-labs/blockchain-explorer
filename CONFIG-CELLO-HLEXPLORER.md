
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

#Fabric Cluster started using Hyperledger Cello and configure to Explorer

##Verify docker is running from Master Node

1. docker -H <YOUR IP>:2375 info

##Verify Peer is running and get Ip to configure in explorer from Worker Node

1. docker ps

9e807ff75243 hyperledger/fabric-peer:1.1.0 "peer node start" About an hour ago Up About an hour 0.0.0.0:7750->7051/tcp, 0.0.0.0:7650->7053/tcp 5688ceeb13b24e1492b2b2ed676df6e0_peer1_org2

ff768afdbe14 hyperledger/fabric-peer:1.1.0 "peer node start" About an hour ago Up About an hour 0.0.0.0:7350->7051/tcp, 0.0.0.0:7250->7053/tcp 5688ceeb13b24e1492b2b2ed676df6e0_peer1_org1

bc86570c2b37 hyperledger/fabric-peer:1.1.0 "peer node start" About an hour ago Up About an hour 0.0.0.0:7550->7051/tcp, 0.0.0.0:7450->7053/tcp 5688ceeb13b24e1492b2b2ed676df6e0_peer0_org2

c51e6636bb45 hyperledger/fabric-peer:1.1.0 "peer node start" About an hour ago Up About an hour 0.0.0.0:7150->7051/tcp, 0.0.0.0:7050->7053/tcp 5688ceeb13b24e1492b2b2ed676df6e0_peer0_org1

ed09a52dba0e hyperledger/fabric-orderer:1.1.0 "orderer" About an hour ago Up About an hour 0.0.0.0:8050->7050/tcp 5688ceeb13b24e1492b2b2ed676df6e0_orderer

2. docker log  c51e6636bb45 ( to verify all peer is up without any error)

##Hyperledger Explorer configuration

/app/platform/fabric/config.json (change the configuration , request,event,server-hostname,tls_cacerts,admin(key,value), channelname,mspid,server-hostname,requests,tls_cacerts)

- Sample configuration provided, see file: blockchain-explorer/app/platform/fabric/config-cello.json.
