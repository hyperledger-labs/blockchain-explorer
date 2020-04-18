
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## Troubleshooting TechNotes - Hyperledger Explorer

#### Problem Description: Hyperledger explorer application fails to start

##### Background Information:
```
    Error:
    at Object._errnoException (util.js:1022:11)
        at _exceptionWithHostPort (util.js:1044:20)
        at Server.setupListenHandle [as _listen2] (net.js:1351:14)
        at listenInCluster (net.js:1392:12)
        at Server.listen (net.js:1476:7)
        at Object.<anonymous> (/home/USERID/workspace/release-3.2/blockchain-explorer/main.js:519:8)
        at Module._compile (module.js:643:30)
        at Object.Module._extensions..js (module.js:654:10)
        at Module.load (module.js:556:32)
        at tryModuleLoad (module.js:499:12)

```
##### Possible cause:
    Another node process is running
##### Possible solution:
    $pkill node
    Before killing the node , check that same port is running `“ps -ef | grep node”` if yes kill the particular port “ kill -9 ‘number’” . if no change the port in config.json

##### Related Information:

#### Problem Description: Hypeledger Explorer fails to start, ENOENT: no such file or directory, scandir

##### Background Information:
```
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    fs.js:904
    return binding.readdir(pathModule._makeLong(path), options.encoding);

    Error: ENOENT: no such file or directory, scandir'fabric-path/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore'
        at Object.fs.readdirSync (fs.js:904:18)
        at Object.readAllFiles (/Users/USER_ID/workspace/blockchain-explorer/app/helper.js:25:17)
        at FabricClientProxy.setAdminForClient (/Users/USER_ID/workspace/blockchain-explorer/app/FabricClientProxy.js:114:35)
        at configuration.getOrgs.forEach.key (/Users/USER_ID/workspace/blockchain-explorer/app/FabricClientProxy.js:145:10)
        at Array.forEach (<anonymous>)
        at FabricClientProxy.createDefault (/Users/USER_ID/workspace/blockchain-explorer/app/FabricClientProxy.js:137:27)
        at new FabricClientProxy (/Users/USER_ID/workspace/blockchain-explorer/app/FabricClientProxy.js:32:8)
        at Object.<anonymous> (/Users/USER_ID/workspace/blockchain-explorer/app/FabricClientProxy.js:184:18)
        at Module._compile (module.js:652:30)
        at Object.Module._extensions..js (module.js:663:10)

```

##### Possible cause:
    No fabric network configured
##### Possible solution:
	update config.json “fabric-path/” with the path to your fabric network

##### Related Information:

#### Problem Description: Hyperledger Explorer fails to run, Client has already been connected. You cannot reuse a client.

##### Background Information:
```
    error when connecting to db: Error: Client has already been connected. You cannot reuse a client.
        at Client.connect (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/client.js:59:17)
        at Timeout.handleDisconnect [as _onTimeout] (/Users/USER_ID/workspace/blockchain-explorer/app/db/pgservice.js:34:12)
        at ontimeout (timers.js:498:11)
        at tryOnTimeout (timers.js:323:5)
        at Timer.listOnTimeout (timers.js:290:5)

```
##### Possible cause:
    No database schema defined
##### Possible solution:
	 Follow up README.md document database setup instructions
            ## Database setup

##### Related Information:

#### Problem Description: No postgres service available

##### Background Information:
```
    Niks-MacBook-Pro:blockchain-explorer USER_ID$ sudo -u postgres psql
    sudo: unknown user: postgres
    sudo: unable to initialize policy plugin

```
##### Possible cause:
    No postgres service running

##### Possible solution:
    Verify if postgresql service is running, and you can run command
    $psql postgres
    To see the port postgresql is running,
    run from `postgres=#`
    `SELECT * FROM pg_settings WHERE name = 'port';`

##### Related Information:

#### Problem Information:
    Hyperledger Explorer failed to start, EADDRINUSE :::8080

### Problem Description : Another node process may run

##### Background Information:
```
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    events.js:183
          throw er; // Unhandled 'error' event
          ^
    Error: listen EADDRINUSE :::8080
        at Object._errnoException (util.js:992:11)
        at _exceptionWithHostPort (util.js:1014:20)
        at Server.setupListenHandle [as _listen2] (net.js:1355:14)
        at listenInCluster (net.js:1396:12)
        at Server.listen (net.js:1480:7)
        at Object.<anonymous> (/Users/USER_ID/workspace/blockchain-explorer/main.js:567:8)
        at Module._compile (module.js:652:30)
        at Object.Module._extensions..js (module.js:663:10)
        at Module.load (module.js:565:32)
        at tryModuleLoad (module.js:505:12)
```
##### Possible solution:
     Terminate node process, issue command: $ pkill node

##### Related Information:

#### Problem Information:
    Hyperledger Explorer failed to start, column "channel_hash" of relation "channel" does not exist

#### Problem Description: Postgresql schema updates needed

##### Background Information:
```
    Insert sql is INSERT INTO channel  ( "name","createdt","blocks","trans","channel_hash" ) VALUES( $1,$2,$3,$4,$5  ) RETURNING *;
    [2018-06-03 09:43:58.496] [ERROR] pgservice - [INSERT ERROR] -  column "channel_hash" of relation "channel" does not exist
        error: column "channel_hash" of relation "channel" does not exist
            at Connection.parseE (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/connection.js:545:11)
            at Connection.parseMessage (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/connection.js:370:19)
            at Socket.<anonymous> (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/connection.js:113:22)
            at emitOne (events.js:116:13)
            at Socket.emit (events.js:211:7)
            at addChunk (_stream_readable.js:263:12)
            at readableAddChunk (_stream_readable.js:250:11)
            at Socket.Readable.push (_stream_readable.js:208:10)
            at TCP.onread (net.js:597:20)
        /Users/USER_ID/workspace/blockchain-explorer/app/db/pgservice.js:99
                    console.log('INSERT ID:', res.rows[0].id);
                                                  ^

        TypeError: Cannot read property 'rows' of undefined
            at Query.client.query [as callback] (/Users/USER_ID/workspace/blockchain-explorer/app/db/pgservice.js:99:43)
            at Query.handleError (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/query.js:143:17)
            at Connection.connectedErrorHandler (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/client.js:132:26)
            at emitOne (events.js:116:13)
            at Connection.emit (events.js:211:7)
            at Socket.<anonymous> (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/connection.js:117:12)
            at emitOne (events.js:116:13)
            at Socket.emit (events.js:211:7)
            at addChunk (_stream_readable.js:263:12)
            at readableAddChunk (_stream_readable.js:250:11)
```
#### Possible Solution:

    Follow up on “Database Setup”, stop node process, $ pkill node, then
    Start hyperledger explorer ./start.sh from root directory

#### Problem Description:  Hyperledger explorer application fails to start, UNAVAILABLE: Connect Failed

##### Background Information:
```
    error: [client-utils.js]: sendPeersProposal - Promise is rejected: Error: 14 UNAVAILABLE: Connect Failed
        at new createStatusError (/home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:64:15)
        at /home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:583:15
    error: [Client.js]: Failed Channels Query. Error: Error: 14 UNAVAILABLE: Connect Failed
        at new createStatusError (/home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:64:15)
        at /home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:583:15
    [2018-06-04 08:06:48.824] [ERROR] FabricClientProxy - Error: 14 UNAVAILABLE: Connect Failed
        at new createStatusError (/home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:64:15)
        at /home/USER_ID/workspace/release-3.2/blockchain-explorer/node_modules/grpc/src/client.js:583:15
    (node:19790) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'forEach' of undefined
        at FabricClientProxy.setChannels (/home/USER_ID/workspace/release-3.2/blockchain-explorer/app/platform/fabric/FabricClientProxy.js:142:24)
        at <anonymous>
    (node:19790) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 3)
    (node:19790) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

```
##### Possible cause:
No fabric network detected based on the explorer configuration

##### Possible solution:
    Verify if fabric network is running
Related Information:

#### Problem Description:  Explorer fails to start

##### Background Information:
```
    /Users/USER_ID/workspace/blockchain-explorer/app/persistence/postgreSQL/db/pgservice.js:319
        if (!res.rows || res.rows.length == 0) resolve(null);
                ^
    TypeError: Cannot read property 'rows' of undefined
        at Query.client.query [as callback] (/Users/USER_ID/workspace/blockchain-explorer/app/persistence/postgreSQL/db/pgservice.js:319:16)
        at Query.handleError (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/query.js:143:17)
        at Connection.connectedErrorHandler (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/client.js:132:26)
        at emitOne (events.js:116:13)
        at Connection.emit (events.js:211:7)
        at Socket.<anonymous> (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/connection.js:117:12)
        at emitOne (events.js:116:13)
        at Socket.emit (events.js:211:7)
        at addChunk (_stream_readable.js:263:12)
        at readableAddChunk (_stream_readable.js:250:11)

```
##### Possible cause:
    No fabric network detected based on the explorer configuration

##### Possible solution:
    Run DB Setup, see README.md

##### Related Information:

#### Problem Description:  db error { error: Ident authentication failed for user "hppoc"

##### Background Information:
```
    I started using (./start.sh) when I call console, I get in the log file the error: postgres://hppoc:password@127.0.0.1:5432/fabricexplorer

    db error { error: Ident authentication failed for user "hppoc"

```
##### Possible cause:
    You could be behind the proxy

##### Possible solution:
    Open firewall, add your IP address to firewall exceptions

##### Related Information:


#### Problem Description:  Cannot read property 'forEach'

##### Background Information:
```
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    (node:22905) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'forEach' of undefined
    at Platform.setChannels (/home/user/blockchain-explorer/app/platform/fabric/Platform.js:188:26)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
    node:22905) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either
    by throwing inside of an async function without a catch block, or by rejecting a promise which was not
    handled with .catch(). (rejection id: 2)
    (node:22905) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future,
    promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
    as per the troubleshooting guides it mentions this kind off error is when we are not able to identify Fabric
    network

```
##### Possible cause:
    Miss configuration in config.json

##### Possible solution:
    Please verify your connection configuration and we do not support Non-TLS, you should have  grpcs and NOT to grpc.

##### Related Information:

#### Problem Description:  Running Explorer on Windows with Docker?
    I get following error when running `./deploy_explorer.sh dockerConfig` from git bash:

##### Background Information:
```
    The command '/bin/sh -c cd $EXPLORER_APP_PATH && cd client && npm install && yarn build' returned a non-zero code: 1
    Hyperledger Fabric network configuration file is located at /c/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/config.json
    Hyperledger Fabric network crypto material at /c/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/crypto
    Stopping previously deployed Hyperledger Fabric Explorer instance...
    Error response from daemon: No such container: blockchain-explorer
    Deploying Hyperledger Fabric Explorer container at 192.168.10.12
    C:\Program Files\Docker\Docker\Resources\bin\docker.exe: Error response from daemon: Mount denied:
    The source path "C:/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/config.json;C"
    doesn't exist and is not known to Docker.

```
##### Possible cause:
    Path on windows OS.
    This is because of Git Bash appending ";C" when converting Windows paths

##### Possible solution:
    Adding a leading "/" before `$network_config_file` and `$network_crypto_base_path` in the `deploy_explorer.sh` file did the trick

##### Related Information:

#### Problem Description:  Explorer fails to start

##### Background Information:
```
    error: [client-utils.js]: sendPeersProposal - Promise is rejected: Error: 14 UNAVAILABLE: Connect Failed
    at new createStatusError (/Users/USER_ID/workspace/blockchain-
     explorer/node_modules/grpc/src/client.js:64:15)
    at /Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:583:15
    error: [Client.js]: Failed Channels Query. Error: Error: 14 UNAVAILABLE: Connect Failed
    at new createStatusError (/Users/USER_ID/workspace/blockchain-
     explorer/node_modules/grpc/src/client.js:64:15)
    at /Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:583:15
    (node:6974) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'forEach' of undefined
    at Platform.setChannels (/Users/USER_ID/workspace/blockchain-
     explorer/app/platform/fabric/Platform.js:188:26)
    at <anonymous>
     (node:6974) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either
    by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled
     with .catch(). (rejection id: 3)
    (node:6974) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future,
     promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

```
##### Possible cause:
    Fabric network down, or unavailable
##### Possible solution:
    Verify fabric network

##### Related Information:

#### Problem Description:  Explorer fails to start

##### Background Information:
```
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    E0823 15:26:47.308219000 140736010920832 ssl_transport_security.cc:989] Handshake failed with fatal
    error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E0823 15:26:48.308717000 140736010920832 ssl_transport_security.cc:989] Handshake failed with fatal
    error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E0823 15:26:50.045342000 140736010920832 ssl_transport_security.cc:989] Handshake failed with fatal
     error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
     error: [Remote.js]: Error: Failed to connect before the deadline
     error: [client-utils.js]: sendPeersProposal - Promise is rejected: Error: Failed to connect before the deadline
     at checkState (/Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:838:16)
     (node:23110) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'forEach' of undefined
       at Platform.setChannels (/Users/USER_ID/workspace/blockchain-
     explorer/app/platform/fabric/Platform.js:192:26)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
   (node:23110) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either
    by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled
    with .catch(). (rejection id: 1)

   (node:23110) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code. E0823 15:26:53.086211000 140736010920832 ssl_transport_security.cc:989] Handshake failed with fatal error
   SSL_ERROR_SSL:error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.

```
##### Possible cause:
    Fabric network down, or unavailable, miss configuration

##### Possible solution:
	Verify fabric network, and if properly configured in config.json


##### Related Information:

###### Problem Description:  Explorer fails to start, fabric 1.2

##### Background Information:
```
    **************************************************************************************
    Error : Failed to connect client peer, please check the configuration and peer status
    Info :  Explorer will continue working with only DB data
    **************************************************************************************
      <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
      Error :  [ 'Default client peer is down and no channel details available database' ]
      Received kill signal, shutting down gracefully
      Closed out connections

```
##### Possible cause:
    Misconfiguration, please configure connection to fabric

##### Possible solution:
    Configure connection to fabric by updating blockchain-explorer/app/platform/fabric/config.json, see instructions provided in README, search for “## Fabric Configure Hyperledger Explorer”

##### Related Information:
    HL Explorer support for HL Fabric 1.2

#### Problem Description:  UNIMPLEMENTED: unknown service discovery.Discovery

##### Background Information:
```
    <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
    { Error: 12 UNIMPLEMENTED: unknown service discovery.Discovery
        at new createStatusError (/Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:64:15)
        at /Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:583:15
      code: 12,
      metadata: Metadata { _internal_repr: {} },
      details: 'unknown service discovery.Discovery' }
    Received kill signal, shutting down gracefully

```
##### Possible cause:
    Fabric version not supported, this could be you’re connecting to HLFabric 1.1
##### Possible solution:
    Configure connection to HL Fabric 1.2,  by updating blockchain-explorer/app/platform/fabric/config.json, see instructions provided in README, search for “## Fabric Configure Hyperledger Explorer”

##### Related Information:
    HL Explorer support for HL Fabric 1.2

#### Problem Description:  HL Explorer fails to start

##### Background Information:
```
    Received kill signal, shutting down gracefully
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>    >>>
    Closed out connections
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>

```
##### Possible cause:
    Another node process may run
##### Possible solution:
    Issue command $pkill node

##### Related Information:
    HL Explorer support for HL Fabric 1.2

#### Problem Description:  Handshake failed with fatal error SSL_ERROR_SSL: error

##### Background Information:
```
    E1004 14:32:11.593740000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E1004 14:32:11.595861000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E1004 14:32:12.594545000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E1004 14:32:12.596974000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E1004 14:32:14.217387000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    E1004 14:32:14.219383000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    error: [Remote.js]: Error: Failed to connect before the deadline
    <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
    Error: Failed to connect before the deadline
        at checkState (/Users/USER_ID/workspace/blockchain-explorer/node_modules/grpc/src/client.js:838:16)
    E1004 14:32:16.436058000 140736003720064 ssl_transport_security.cc:989] Handshake failed with fatal error SSL_ERROR_SSL: error:14090086:SSL routines:ssl3_get_server_certificate:certificate verify failed.
    Received kill signal, shutting down gracefully
    Closed out connections

```
##### Possible cause:
    Missconfiguration in blockchain-explorer/app/platform/fabric/config.json
##### Possible solution:
    Verify all peers, orderers ports, and paths to crypto

##### Related Information:
    HL Explorer support for HL Fabric 1.2

#### Problem Description: HL Explorer fails to start

##### Background Information:
```
    logs/console/console.log output:

    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    (node:28473) DeprecationWarning: grpc.load: Use the @grpc/proto-loader module with grpc.loadPackageDefinition instead

    Please open web browser to access ：http://localhost:8080/

    pid is 28473

    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer

    Sync process is started for the network : [net_basic] and client : [org1]
    (node:28493) DeprecationWarning: grpc.load: Use the @grpc/proto-loader module with grpc.loadPackageDefinition instead
    <<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>
    Error :  [ 'Failed to connect client peer, please check the configuration and peer status' ]
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>


    logs/app/app.log output:

    [2018-10-26 10:20:35.233] [DEBUG] FabricClient - Channel genesis hash for channel [mychannel] >> ac4b7048da8b35c7b740babcb4dd8f911c94a15e45f442d5f6291a66f9b5ec5d
    [2018-10-26 10:20:35.233] [DEBUG] FabricClient - Initialized channel >> mychannel
    [2018-10-26 10:20:35.244] [DEBUG] FabricClient - Set client [cli] default orderer as  >> grpc://localhost:7050
    [2018-10-26 10:20:35.245] [DEBUG] FabricClient - Admin peer Not found for grpc://localhost:7051

```
##### Possible cause:
    peer node default can't access from out of fabric network
##### Possible solution:

    add environment CORE_PEER_GOSSIP_EXTERNALENDPOINT for peer services, For example：

    peer0.org1.example.com:
    container_name: peer0.org1.example.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.org1.example.com
      - CORE_LOGGING_PEER=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051

##### Related Information:
    HL Explorer support for HL Fabric 1.3

#### Problem Description:  Received discovery error:access denied error

##### Background Information:
```
    2019-04-09T18:52:42.477Z - error: [Channel.js]: Channel:mychannel received discovery error:access denied
    2019-04-09T18:52:42.478Z - error: [Channel.js]: Error: Channel:mychannel Discovery error:access denied

   [2019-04-09 14:52:42.442] [DEBUG] FabricClient - Set client [firstnetwork] default channel as  >> mychannel
   [2019-04-09 14:52:42.478] [ERROR] FabricClient - Error: Failed to discover ::Error: Channel:mychannel Discovery error:access denied
    at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
    at <anonymous>
   [2019-04-09 14:52:42.478] [DEBUG] FabricClient - this.defaultPeer  peer0.org1.example.com
   [2019-04-09 14:52:42.490] [ERROR] FabricClient - { Error: 2 UNKNOWN: access denied: channel [] creator org [Org1MSP]
    at Object.exports.createStatusError (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/common.js:87:15)
    at Object.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1188:28)
    at InterceptingListener._callNext (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:564:42)
    at InterceptingListener.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:614:8)
    at callback (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:841:24)
    code: 2,

```
##### Possible cause:
    The "wallet" crypto is incorrect, or outdated
##### Possible solution:
    Delete directory "wallet" located in blockchain-explorer directory, and restart explorer $./start.sh

##### Related Information:
    HL Explorer support for HL Fabric 1.4

#### Problem Description:  error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051

##### Background Information:
```
        at Object.exports.createStatusError (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/common.js:87:15)
        at ClientDuplexStream._emitStatusIfDone (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client.js:235:26)
        at ClientDuplexStream._receiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client.js:213:8)
        at Object.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1290:15)
        at InterceptingListener._callNext (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:564:42)
        at InterceptingListener.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:614:8)
        at /Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1110:18
    code: 14,
    metadata: Metadata { _internal_repr: {} },
    details: 'Connect Failed' }
    2019-04-10T17:41:35.140Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-04-10T17:41:35.141Z - error: [Channel.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-04-10T17:41:38.148Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    SyncServices.synchNetworkConfigToDB client  first-network
    <<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>
    Error: "orderer" request parameter is missing and there are no orderers defined on this channel in the common connection profile
        at Client.getTargetOrderer (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Client.js:1770:12)
        at Channel.getGenesisBlock (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:1060:39)
        at FabricClient.getGenesisBlock (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/FabricClient.js:530:40)
        at SyncServices.synchNetworkConfigToDB (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/sync/SyncService.js:50:34)
        at SyncPlatform.initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/sync/SyncPlatform.js:97:40)
        at <anonymous>
        at process._tickCallback (internal/process/next_tick.js:189:7)
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>
    initializeChannelFromDiscover  mychannel
    initializeChannelFromDiscover  mychannel
    2019-04-10T17:42:18.841Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-04-10T17:42:18.841Z - error: [Channel.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-04-10T17:42:18.843Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-04-10T17:42:18.843Z - error: [Channel.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    Received kill signal, shutting down gracefully
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>
    Closed out connections

```
##### Possible cause:
    Fabric network could be down
##### Possible solution:
    Start you fabric network

##### Related Information:
    HL Explorer support for HL Fabric 1.4

#### Problem Description:  [Channel.js]: Channel:mychannel received discovery error:access denied

##### Background Information:
```
  2019-04-30T14:01:11.375Z - error: [Channel.js]: Channel:mychannel received discovery error:access denied
2019-04-30T14:01:11.376Z - error: [Channel.js]: Error: Channel:mychannel Discovery error:access denied
2019-04-30T14:01:11.396Z - error: [Channel.js]: Channel:mychannel received discovery error:access denied
2019-04-30T14:01:11.396Z - error: [Channel.js]: Error: Channel:mychannel Discovery error:access denied
2019-04-30T14:01:11.396Z - error: [Channel.js]: refresh - failed:Error: Failed to discover ::Error: Channel:mychannel Discovery error:access denied
<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
Error :  [ 'Invalid platform configuration, Please check the log' ]
Received kill signal, shutting down gracefully
Closed out connections

logs from app.log file

[2019-04-30 10:01:11.108] [INFO] FabricGateway - peer0.org1.example.com
[2019-04-30 10:01:11.108] [INFO] FabricGateway - peer0.org1.example.com
[2019-04-30 10:01:11.108] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/5890f0061619c06fb29dea8cb304edecc020fe63f41a6db109f1e227cc1cb2a8_sk
[2019-04-30 10:01:11.108] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/5890f0061619c06fb29dea8cb304edecc020fe63f41a6db109f1e227cc1cb2a8_sk
[2019-04-30 10:01:11.336] [DEBUG] FabricClient - Set client [balance-transfer] default channel as  >> mychannel
[2019-04-30 10:01:11.376] [ERROR] FabricClient - Error: Failed to discover ::Error: Channel:mychannel Discovery error:access denied
    at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
    at <anonymous>
[2019-04-30 10:01:11.377] [DEBUG] FabricClient - this.defaultPeer  peer0.org1.example.com
[2019-04-30 10:01:11.391] [DEBUG] FabricClient - Client channels >> []
[2019-04-30 10:01:11.396] [DEBUG] FabricClient - Channel Discovery >>  [object Object]

```
##### Possible cause:
    This error was reported when running balance transfer sample provided by HLFabric, version 1.4
##### Possible solution:
```
    $cd <path to project>blockchain-explorer/app/persistence/fabric/postgreSQL/db/
    Run ./createDB.sh
    Delete all under "wallet" folder, and make sure balance transfer is running, two steps required:
    run from <fabric-samples path>fabric-samples/balance-transfer
    $./runApp.sh
    from a new terminal run $./testAPIs.sh
```
##### Related Information:
    HL Explorer support for HL Fabric 1.4

#### Problem Description:  [error: [NetworkConfig101.js]: NetworkConfig101 - problem reading the PEM file :: Error: ENOENT: no such file or directory Error : Failed to connect client peer, please check the configuration and peer status

##### Background Information:
```
    2019-05-01T12:33:58.907Z - error: [NetworkConfig101.js]: NetworkConfig101 - problem reading the PEM file :: Error: ENOENT: no such file or directory, open '/fabric-path/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem'
    { Error: ENOENT: no such file or directory, open '/fabric-path/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem'
        at Object.fs.openSync (fs.js:646:18)
        at Object.fs.readFileSync (fs.js:551:33)
        at readFileSync (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/impl/NetworkConfig_1_0.js:425:19)
        at getPEMfromConfig (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/impl/NetworkConfig_1_0.js:414:13)
        at getTLSCACert (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/impl/NetworkConfig_1_0.js:401:10)
        at NetworkConfig_1_0.getCertificateAuthority (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/impl/NetworkConfig_1_0.js:303:6)
        at NetworkConfig_1_0.getOrganization (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/impl/NetworkConfig_1_0.js:257:23)
        at Client._setAdminFromConfig (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Client.js:1306:53)
        at Client.loadFromConfig (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Client.js:134:9)
        at Function.loadFromConfig (/Users/USED_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Client.js:116:10)
    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/fabric-path/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem' }

    ********* call to initializeDetachClient **********
    initializeDetachClient --> client_config  { name: 'balance-transfer',
    profile: './connection-profile/balance-transfer.json' }  name  balance-transfer
    initializeDetachClient, network config)  { name: 'balance-transfer-network',
    version: '1.0.0',
    license: 'Apache-2.0',
    client:
    { tlsEnable: true,
        adminUser: 'admin',
        adminPassword: 'adminpw',
        enableAuthentication: true,
        organization: 'Org1',
        connection: { timeout: [Object] } },
    channels: { mychannel: { orderers: [Array], peers: [Object] } },
    organizations:
    { Org1:
        { mspid: 'Org1MSP',
            peers: [Array],
            certificateAuthorities: [Array],
            adminPrivateKey: [Object],
            signedCert: [Object] } },
    peers:
    { 'peer0.org1.example.com':
        { url: 'grpcs://localhost:7051',
            grpcOptions: [Object],
            tlsCACerts: [Object] } },
    certificateAuthorities:
    { 'ca-org1':
        { url: 'https://localhost:7054',
            httpOptions: [Object],
            tlsCACerts: [Object],
            caName: 'ca-org1' } } }

        ************************************* initializeDetachClient *************************************************
        Error : Failed to connect client peer, please check the configuration and peer status
        Info :  Explorer will continue working with only DB data
        ************************************** initializeDetachClient ************************************************

        FabricUtils.createDetachClient


        Please open web browser to access ：http://localhost:8080/


        pid is 34517


        FabricConfig, this.config.channels  mychannel
        <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
        Error :  [ 'Default client peer is down and no channel details available database' ]
        Received kill signal, shutting down gracefully
        <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>
        Closed out connections

```
##### Possible cause:
    Misconfiguration, this error was reported when running balance transfer sample provided by HLFabric, version 1.4
##### Possible solution:
    Update configuration, verify all paths are valid in connection profile

##### Related Information:
    HL Explorer support for HL Fabric 1.4

#### Problem Description:  Error: ENOENT: no such file or directory, open

##### Background Information:
```
    ******* Initialization started for hyperledger fabric platform ******, { 'first-network':
    { name: 'first-network',
        profile: './connection-profile/first-network.json' } }
    client_configs.name  first-network  client_configs.profile  ./connection-profile/first-network.json
    FabricUtils.createFabricClient
    FabricConfig, this.config.channels  mychannel
    { Error: ENOENT: no such file or directory, open '/Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk'
        at Object.fs.openSync (fs.js:646:18)
        at Object.fs.readFileSync (fs.js:551:33)
        at FabricGateway._enrollUserIdentity (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js:189:20)
        at FabricGateway.initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js:116:33)
        at <anonymous>
    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk' }

    ********* call to initializeDetachClient **********
    initializeDetachClient --> client_config  { name: 'first-network',
    profile: './connection-profile/first-network.json' }  name  first-network
    initializeDetachClient, network config)  { name: 'first-network',
    version: '1.0.0',
    license: 'Apache-2.0',
    client:
    { tlsEnable: true,
        adminUser: 'admin',
        adminPassword: 'adminpw',
        enableAuthentication: false,
        organization: 'Org1',
        connection: { timeout: [Object] } },
    channels: { mychannel: { peers: [Object], connection: [Object] } },
    organizations:
    { Org1MSP:
        { mspid: 'Org1MSP',
            adminPrivateKey: [Object],
            signedCert: [Object] } },
    peers:
    { 'peer0.org1.example.com':
        { tlsCACerts: [Object],
            url: 'grpcs://localhost:7051',
            eventUrl: 'grpcs://localhost:7053',
            grpcOptions: [Object] } } }

    ************************************* initializeDetachClient *************************************************
    Error : Failed to connect client peer, please check the configuration and peer status
    Info :  Explorer will continue working with only DB data
    ************************************** initializeDetachClient ************************************************

    FabricUtils.createDetachClient


    Please open web browser to access ：http://localhost:8080/


    pid is 35924


    FabricConfig, this.config.channels  mychannel
    <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
    Error :  [ 'Default client peer is down and no channel details available database' ]
    Received kill signal, shutting down gracefully
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>
    Closed out connections

    app.log
        [2019-05-01 10:45:56.932] [ERROR] FabricClient - Error: Failed to discover ::Error: Failed to connect before the deadline URL:grpcs://localhost:7051
        at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
        at <anonymous>
        at process._tickCallback (internal/process/next_tick.js:189:7)
    [2019-05-01 10:45:56.934] [DEBUG] FabricClient - this.defaultPeer  peer0.org1.example.com
    [2019-05-01 11:48:29.518] [DEBUG] Platform - ******* Initialization started for hyperledger fabric platform ******
    [2019-05-01 11:48:29.520] [DEBUG] Platform - Setting admin organization enrolment files
    [2019-05-01 11:48:29.521] [DEBUG] Platform - Creating client [[object Object]] >>  first-network
    [2019-05-01 11:48:29.521] [DEBUG] FabricUtils - ************ Initializing fabric client for [first-network]************
    [2019-05-01 11:48:29.522] [DEBUG] FabricClient - Client configuration [first-network]  ...  this.client_config  { name: 'first-network',
    profile: './connection-profile/first-network.json' }
    [2019-05-01 11:48:29.523] [DEBUG] FabricGateway -
    LOADING CONFIGURATION  [OBJECT OBJECT]

    [2019-05-01 11:48:29.523] [DEBUG] FabricGateway -
    LOADING CONFIGURATION  [OBJECT OBJECT]

    [2019-05-01 11:48:29.524] [INFO] FabricGateway - peer0.org1.example.com
    [2019-05-01 11:48:29.524] [INFO] FabricGateway - peer0.org1.example.com
    [2019-05-01 11:48:29.524] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
    adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk
    [2019-05-01 11:48:29.524] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
    adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk
    [2019-05-01 11:48:29.552] [ERROR] FabricGateway -  Error: ENOENT: no such file or directory, open '/Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk'
    [2019-05-01 11:48:29.552] [ERROR] FabricGateway -  Error: ENOENT: no such file or directory, open '/Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/955443f3286143c24aebe1e28c6601e145fe8a9c15d41beb2ab9b21d948327da_sk'
    [2019-05-01 11:48:29.553] [ERROR] FabricClient - { ExplorerError: [ 'Failed to create wallet, please check the configuration, and valid file paths' ]
        at FabricGateway.initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js:147:13)
        at <anonymous>
    name: 'ExplorerError',
    message: '[ \'Failed to create wallet, please check the configuration, and valid file paths\' ]' }
    [2019-05-01 11:48:29.553] [DEBUG] FabricClient - this.defaultPeer  {}
    [2019-05-01 11:48:29.553] [ERROR] FabricClient - TypeError: Cannot read property 'queryChannels' of null
        at FabricClient.initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/FabricClient.js:101:40)
        at <anonymous>

```
##### Possible cause:
    Misconfiguration, this error was reported when running balance transfer sample provided by HLFabric, version 1.4
##### Possible solution:
    Update configuration , verify all paths are valid in connection profile

##### Related Information:
    HL Explorer support for HL Fabric 1.3

#### Problem Description:   UNAVAILABLE: Connect Failed,   Error: Failed to discover ::Error: Failed to connect before the deadline

##### Background Information:
```
    URL:grpcs://localhost:7051
    { Error: 14 UNAVAILABLE: Connect Failed
        at Object.exports.createStatusError (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/common.js:87:15)
        at ClientDuplexStream._emitStatusIfDone (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client.js:235:26)
        at ClientDuplexStream._receiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client.js:213:8)
        at Object.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1290:15)
        at InterceptingListener._callNext (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:564:42)
        at InterceptingListener.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:614:8)
        at /Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1110:18
    code: 14,
    metadata: Metadata { _internal_repr: {} },
    details: 'Connect Failed' }
    2019-05-01T16:04:01.755Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-05-01T16:04:01.756Z - error: [Channel.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    2019-05-01T16:04:04.764Z - error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://localhost:7051
    SyncServices.synchNetworkConfigToDB client  first-network
    <<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>
    Error: "orderer" request parameter is missing and there are no orderers defined on this channel in the common connection profile
        at Client.getTargetOrderer (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Client.js:1770:12)
        at Channel.getGenesisBlock (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:1060:39)
        at FabricClient.getGenesisBlock (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/FabricClient.js:530:40)
        at SyncServices.synchNetworkConfigToDB (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/sync/SyncService.js:50:34)
        at SyncPlatform.initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/app/platform/fabric/sync/SyncPlatform.js:97:40)
        at <anonymous>
        at process._tickCallback (internal/process/next_tick.js:189:7)
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>
    app.log
    [2019-05-01 12:09:58.039] [DEBUG] Proxy - getPeersStatus >> 0
    [2019-05-01 12:10:58.034] [DEBUG] Proxy - getPeersStatus >>  Error: Failed to discover ::Error: Failed to connect before the deadline URL:grpcs://localhost:7051
        at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
        at <anonymous>
        at process._tickCallback (internal/process/next_tick.js:189:7)
    [2019-05-01 12:10:58.035] [DEBUG] Proxy - getPeersStatus >> 0
    [2019-05-01 12:10:58.040] [DEBUG] Proxy - getPeersStatus >>  Error: Failed to discover ::Error: Failed to connect before the deadline URL:grpcs://localhost:7051
        at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
        at <anonymous>
        at process._tickCallback (internal/process/next_tick.js:189:7)
    [2019-05-01 12:10:58.041] [DEBUG] Proxy - getPeersStatus >> 0

```
##### Possible cause:
    HL Fabric network down
##### Possible solution:
   Start HLFabric networ, and updtae connection profile to HL Fabric network
##### Related Information:
    HL Explorer support for HL Fabric 1.3

#### Problem Description:  [Channel.js]: Channel:mychannel received discovery error:access denied

##### Background Information:
```
    false 'ssl-certs' '/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/ssl-certs'
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    ******* Initialization started for hyperledger fabric platform ******, { 'first-network':
    { name: 'first-network',
        profile: './connection-profile/first-network.json' } }
    client_configs.name  first-network  client_configs.profile  ./connection-profile/first-network.json
    FabricUtils.createFabricClient
    FabricConfig, this.config.channels  mychannel
    An identity for the admin user: admin already exists in the wallet
    2019-05-01T16:16:50.467Z - error: [Channel.js]: Channel:mychannel received discovery error:access denied
    2019-05-01T16:16:50.468Z - error: [Channel.js]: Error: Channel:mychannel Discovery error:access denied

    ********* call to initializeDetachClient **********
    initializeDetachClient --> client_config  { name: 'first-network',
    profile: './connection-profile/first-network.json' }  name  first-network
    initializeDetachClient, network config)  { name: 'first-network',
    version: '1.0.0',
    license: 'Apache-2.0',
    client:
    { tlsEnable: true,
        adminUser: 'admin',
        adminPassword: 'adminpw',
        enableAuthentication: false,
        organization: 'Org1',
        connection: { timeout: [Object] } },
    channels: { mychannel: { peers: [Object], connection: [Object] } },
    organizations:
    { Org1MSP:
        { mspid: 'Org1MSP',
            adminPrivateKey: [Object],
            signedCert: [Object] } },
    peers:
    { 'peer0.org1.example.com':
        { tlsCACerts: [Object],
            url: 'grpcs://localhost:7051',
            eventUrl: 'grpcs://localhost:7053',
            grpcOptions: [Object] } } }

    ************************************* initializeDetachClient *************************************************
    Error : Failed to connect client peer, please check the configuration and peer status
    Info :  Explorer will continue working with only DB data
    ************************************** initializeDetachClient ************************************************

    FabricUtils.createDetachClient


    Please open web browser to access ：http://localhost:8080/


    pid is 37132


    FabricConfig, this.config.channels  mychannel
    <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
    Error :  [ 'Default client peer is down and no channel details available database' ]
    Received kill signal, shutting down gracefully
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>
    Closed out connections

    app.log
        [2019-05-01 12:16:50.198] [DEBUG] Platform - ******* Initialization started for hyperledger fabric platform ******
    [2019-05-01 12:16:50.199] [DEBUG] Platform - Setting admin organization enrolment files
    [2019-05-01 12:16:50.199] [DEBUG] Platform - Creating client [[object Object]] >>  first-network
    [2019-05-01 12:16:50.200] [DEBUG] FabricUtils - ************ Initializing fabric client for [first-network]************
    [2019-05-01 12:16:50.200] [DEBUG] FabricClient - Client configuration [first-network]  ...  this.client_config  { name: 'first-network',
    profile: './connection-profile/first-network.json' }
    [2019-05-01 12:16:50.201] [DEBUG] FabricGateway -
    LOADING CONFIGURATION  [OBJECT OBJECT]

    [2019-05-01 12:16:50.201] [DEBUG] FabricGateway -
    LOADING CONFIGURATION  [OBJECT OBJECT]

    [2019-05-01 12:16:50.201] [INFO] FabricGateway - peer0.org1.example.com
    [2019-05-01 12:16:50.201] [INFO] FabricGateway - peer0.org1.example.com
    [2019-05-01 12:16:50.201] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
    adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/9de69e9c615778a11926ff0fdb0cf704473537e7cc301ef4153a11492b2e29c1_sk
    [2019-05-01 12:16:50.201] [INFO] FabricGateway - /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
    adminPrivateKeyPath  /Users/USER_ID/workspace/fabric-1.3/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/9de69e9c615778a11926ff0fdb0cf704473537e7cc301ef4153a11492b2e29c1_sk
    [2019-05-01 12:16:50.432] [DEBUG] FabricClient - Set client [first-network] default channel as  >> mychannel
    [2019-05-01 12:16:50.468] [ERROR] FabricClient - Error: Failed to discover ::Error: Channel:mychannel Discovery error:access denied
        at Channel._initialize (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/Channel.js:347:11)
        at <anonymous>
    [2019-05-01 12:16:50.468] [DEBUG] FabricClient - this.defaultPeer  peer0.org1.example.com
    [2019-05-01 12:16:50.479] [ERROR] FabricClient - { Error: 2 UNKNOWN: access denied: channel [] creator org [Org1MSP]
        at Object.exports.createStatusError (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/common.js:87:15)
        at Object.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:1188:28)
        at InterceptingListener._callNext (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:564:42)
        at InterceptingListener.onReceiveStatus (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:614:8)
        at callback (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/grpc/src/client_interceptors.js:841:24)
    code: 2,
    metadata: Metadata { _internal_repr: {} },
    details: 'access denied: channel [] creator org [Org1MSP]' }
    [2019-05-01 12:16:50.483] [INFO] main - Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging.

```
##### Possible cause:
    Invalid signingIdentity
##### Possible solution:
    - Delete everything under the "wallet" directory
    - ./start.sh start HL Explorer
##### Related Information:
    HL Explorer support for HL Fabric 1.3

#### Problem Description:  Error: Received status message on the block stream. status:NOT_FOUND

##### Background Information:
```
        at ClientDuplexStream._stream.on (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/lib/ChannelEventHub.js:539:23)
        at emitOne (events.js:116:13)
        at ClientDuplexStream.emit (events.js:211:7)
        at addChunk (_stream_readable.js:263:12)
        at readableAddChunk (_stream_readable.js:250:11)
        at ClientDuplexStream.Readable.push (_stream_readable.js:208:10)
        at Object.onReceiveMessage (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/node_modules/grpc/src/client_interceptors.js:1292:19)
        at InterceptingListener.recvMessageWithContext (/Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/node_modules/grpc/src/client_interceptors.js:607:19)
        at /Users/USER_ID/workspace/EXPLORER-MIN-CONFIG/blockchain-explorer/node_modules/fabric-network/node_modules/fabric-client/node_modules/grpc/src/client_interceptors.js:706:14
    initializeChannelFromDiscover  mychannel
    initializeChannelFromDiscover  mychannel
    2019-05-14T18:15:30.333Z - error: [Channel.js]: Channel:mychannel received discovery error:access denied

```
##### Possible cause:
    Invalid signingIdentity, channel Blockhash mismatch with database
##### Possible solution:
    - Delete everything under the "wallet" directory
    - Run $ blockchain-explorer/app/persistence/fabric/postgreSQL/db/createdb.sh
    - ./start.sh start HL Explorer
##### Related Information:
    HL Explorer support for HL Fabric 1.4

#### Problem Description: Hyperledger Explorer error when connecting to db: error: Ident authentication failed for user "hppoc"

##### Background Information:
```
  false ssl-certs /produtos/hyperledger-blockchain/blockchain-explorer/ssl-certs
error when connecting to db: error: Ident authentication failed for user "hppoc"
    at Connection.parseE (/produtos/hyperledger-blockchain/blockchain-explorer/node_modules/pg/lib/connection.js:604:11)

error when connecting to db: error: Ident authentication failed for user "hppoc"
    at Connection.parseE (/produtos/hyperledger-blockchain/blockchain-explorer/node_modules/pg/lib/connection.js:604:11)
    at Connection.parseMessage (/produtos/hyperledger-blockchain/blockchain-explorer/node_modules/pg/lib/connection.js:401:19)
    at Socket.<anonymous> (/produtos/hyperledger-blockchain/blockchain-explorer/node_modules/pg/lib/connection.js:121:22)
    at Socket.emit (events.js:210:5)
    at addChunk (_stream_readable.js:309:12)
    at readableAddChunk (_stream_readable.js:290:11)
    at Socket.Readable.push (_stream_readable.js:224:10)
    at TCP.onStreamRead (internal/stream_base_commons.js:182:23) {
  .......
...
  file: 'auth.c',
  line: '308',
  routine: 'auth_failed'
}
error when connecting to db: TypeError: Cannot read property 'on' of undefined
    at Timeout.handleDisconnect [as _onTimeout] (/produtos/hyperledger-blockchain/blockchain-explorer/app/persistence/postgreSQL/PgService.js:95:16)
    at listOnTimeout (internal/timers.js:531:17)
    at processTimers (internal/timers.js:475:7)
<<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
TypeError [ERR_INVALID_CALLBACK]: Callback must be a function. Received undefined
    at setTimeout (timers.js:118:11)
    at Timeout.handleDisconnect [as _onTimeout] (/produtos/hyperledger-blockchain/blockchain-explorer/app/persistence/postgreSQL/PgService.js:112:5)
    at listOnTimeout (internal/timers.js:531:17)
    at processTimers (internal/timers.js:475:7) {
  code: 'ERR_INVALID_CALLBACK'
}

.....
...
error when connecting to db: TypeError: Cannot read property 'on' of undefined
    at Timeout.handleDisconnect [as _onTimeout] (/produtos/hyperledger-blockchain/blockchain-explorer/app/persistence/postgreSQL/PgService.js:95:16)
    at listOnTimeout (internal/timers.js:531:17)
    at processTimers (internal/timers.js:475:7)
<<<<<<<<<<<<<<<<<<<<<<<<<< Synchronizer Error >>>>>>>>>>>>>>>>>>>>>
TypeError [ERR_INVALID_CALLBACK]: Callback must be a function. Received undefined
    at setTimeout (timers.js:118:11)
    at Timeout.handleDisconnect [as _onTimeout] (/produtos/hyperledger-blockchain/blockchain-explorer/app/persistence/postgreSQL/PgService.js:112:5)
    at listOnTimeout (internal/timers.js:531:17)
    at processTimers (internal/timers.js:475:7) {
  code: 'ERR_INVALID_CALLBACK'
}
<<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>
Received kill signal, shutting down gracefully
<<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>>>>
Closed out connections
<<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>
```
##### Possible cause:
    Permission related, Postgres is trying to authenticate a user using the Ident protocol, and can't.
##### Possible solution:

The ident authentication method works by obtaining the client's operating
system user name from an ident server and using it as the allowed database
user name (with an optional user name mapping). This is only supported on TCP/IP connections.

Identify the location and edit the pg_hba.conf file

 ``` /var/lib/pgsql/9.6/data/pg_hba.conf ```

change:

``` host all all 127.0.0.1/32 ident ```

to

``` host all all 127.0.0.1/32 md5 ```

##### Related Information:
 Full error info at https://pastebin.com/fyNSp66K

#### Problem Description: Hypeledger Explorer fails to start, not assigned to this channel

##### Background Information:

```bash
error: [Channel.js]: Error: Peer with name "peer0.example.com" not assigned to this channel
error: [Remote.js]: Error: Failed to connect before the deadline URL:grpcs://peer0.example.com:7051
```

##### Possible cause:

    Invalid peer name in "channels.<channel name>.peers.<peer name>" or "peers.<peer name>" defined in connection.json file.

##### Possible solution:
    Fix and match to the valid peer name in this channels or peers in connection.json

##### Related Information:

### Docker Troubleshooting commands

List your networks ``` $docker network ls ```

List docker images id ``` $docker images | grep block ```

Remove an image ``` $docker rmi <image_id> ```

Login to docker ``` $docker exec -it <image_id> sh ```

Read explorer app log ``` $docker exec <image_id> cat /opt/logs/app/app.log ```

Inspect real IPs ``` $docker inspect <image_id> | grep IPAddress ```

Stop and remove dockers

``` $docker stop $(docker ps -a -q) ```
``` $docker rm -f $(docker ps -a -q) ```

Remove default fabric crypto

``` $rm -rf ./crypto-config/* ```
``` $rm -rf ~/.hfc* ```

From the docker ($docker exec -it <image_id> sh)

Install curl: ``` $apk update && apk add curl ```

Use curl in docker to query explorer REST API
Example: ``` $curl http://localhost:8080/api/channels ```

Example response: ``` {"status":200,"channels":["dockerchannel","mychannel"] ```



