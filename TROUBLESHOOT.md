## Troubleshooting TechNotes - Hyperledger Explorer

### Problem Description: Hyperledger explorer application fails to start

#### Background Information
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

#### Possible cause:
    Another node process is running
#### Possible solution:
    $pkill node
    Before killing the node , check that same port is running `“ps -ef | grep node”` if yes kill the particular port “ kill -9 ‘number’” . if no change the port in config.json
####Related Information:
    
### Problem Description: Hypeledger Explorer fails to start, ENOENT: no such file or directory, scandir

#### Background Information
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    fs.js:904
    return binding.readdir(pathModule._makeLong(path), options.encoding);
                     ^
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


#### Possible cause:
    No fabric network configured
#### Possible solution:
	update config.json “fabric-path/” with the path to your fabric network
#### Related Information:


### Problem Description: Hyperledger Explorer fails to run, Client has already been connected. You cannot reuse a client.

#### Background Information:
    error when connecting to db: Error: Client has already been connected. You cannot reuse a client.
        at Client.connect (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/client.js:59:17)
        at Timeout.handleDisconnect [as _onTimeout] (/Users/USER_ID/workspace/blockchain-explorer/app/db/pgservice.js:34:12)
        at ontimeout (timers.js:498:11)
        at tryOnTimeout (timers.js:323:5)
        at Timer.listOnTimeout (timers.js:290:5)

#### Possible cause:
    No database schema defined
#### Possible solution:
	 Follow up README.md document database setup instructions
            ## Database setup

#### Related Information:

### Problem Description: No postgres service available

#### Background Information:
    Niks-MacBook-Pro:blockchain-explorer USER_ID$ sudo -u postgres psql
    sudo: unknown user: postgres
    sudo: unable to initialize policy plugin

#### Possible cause:
    No postgres service running
#### Possible solution:
    Verify if postgresql service is running, and you can run command
    $psql postgres
    To see the port postgresql is running,
    run from `postgres=#`
    `SELECT * FROM pg_settings WHERE name = 'port';`

#### Related Information:

#### Problem Information:
    Hyperledger Explorer failed to start, EADDRINUSE :::8080

### Problem Description : Another node process may run

#### Background Information:
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

#### Possible solution:
     Terminate node process, issue command: $ pkill node

#### Related Information:

#### Problem Information:
    Hyperledger Explorer failed to start, column "channel_hash" of relation "channel" does not exist

### Problem Description: Postgresql schema updates needed

#### Background Information:
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

#### Possible Solution:

    Follow up on “Database Setup”, stop node process, $ pkill node, then
    Start hyperledger explorer ./start.sh from root directory


### Problem Description:  Hyperledger explorer application fails to start, UNAVAILABLE: Connect Failed

#### Background Information
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

#### Possible cause:
No fabric network detected based on the explorer configuration
#### Possible solution:
    Verify if fabric network is running
Related Information:


### Problem Description:  Explorer fails to start

#### Background Information
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

#### Possible cause:
    No fabric network detected based on the explorer configuration

#### Possible solution:
    Run DB Setup, see README.md

#### Related Information:

### Problem Description:  db error { error: Ident authentication failed for user "hppoc"

#### Background Information

    I started using (./start.sh) when I call console, I get in the log file the error: postgres://hppoc:password@127.0.0.1:5432/fabricexplorer

    db error { error: Ident authentication failed for user "hppoc"

#### Possible cause:
    You could be behind the proxy

#### Possible solution:
    Open firewall, add your IP address to firewall exceptions

#### Related Information:


### Problem Description:  Cannot read property 'forEach'

#### Background Information
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

#### Possible cause:
    Miss configuration in config.json

#### Possible solution:
    Please verify your connection configuration and we do not support Non-TLS, you should have  grpcs and NOT to grpc.

#### Related Information:

### Problem Description:  Running Explorer on Windows with Docker?
    I get following error when running `./deploy_explorer.sh dockerConfig` from git bash:

#### Background Information

    The command '/bin/sh -c cd $EXPLORER_APP_PATH && cd client && npm install && yarn build' returned a non-zero code: 1
    Hyperledger Fabric network configuration file is located at /c/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/config.json
    Hyperledger Fabric network crypto material at /c/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/crypto
    Stopping previously deployed Hyperledger Fabric Explorer instance...
    Error response from daemon: No such container: blockchain-explorer
    Deploying Hyperledger Fabric Explorer container at 192.168.10.12
    C:\Program Files\Docker\Docker\Resources\bin\docker.exe: Error response from daemon: Mount denied:
    The source path "C:/Git/website-request/hyperledger/blockchain-explorer/examples/docker_config/config.json;C"
    doesn't exist and is not known to Docker.

#### Possible cause:
    Path on windows OS.
    This is because of Git Bash appending ";C" when converting Windows paths

#### Possible solution:
    Adding a leading "/" before `$network_config_file` and `$network_crypto_base_path` in the `deploy_explorer.sh` file did the trick

#### Related Information:

### Problem Description:  Explorer fails to start

#### Background Information
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

#### Possible cause:
    Fabric network down, or unavailable
#### Possible solution:
    Verify fabric network

#### Related Information:


### Problem Description:  Explorer fails to start

#### Background Information:
 
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
    

#### Possible cause:
          Fabric network down, or unavailable, miss configuration
#### Possible solution:
	Verify fabric network, and if properly configured in config.json


#### Related Information:

##### Problem Description:  Explorer fails to start, fabric 1.2

#### Background Information:
    
       **************************************************************************************
    Error : Failed to connect client peer, please check the configuration and peer status
    Info :  Explorer will continue working with only DB data
    **************************************************************************************
      <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
      Error :  [ 'Default client peer is down and no channel details available database' ]
      Received kill signal, shutting down gracefully
      Closed out connections


#### Possible cause:
    Misconfiguration, please configure connection to fabric
#### Possible solution:
    Configure connection to fabric by updating blockchain-explorer/app/platform/fabric/config.json, see instructions provided in README, search for “## Fabric Configure Hyperledger Explorer”

#### Related Information:
    HL Explorer support for HL Fabric 1.2

### Problem Description:  UNIMPLEMENTED: unknown service discovery.Discovery

#### Background Information:
        <<<<<<<<<<<<<<<<<<<<<<<<<< Explorer Error >>>>>>>>>>>>>>>>>>>>>
    { Error: 12 UNIMPLEMENTED: unknown service discovery.Discovery
        at new createStatusError (/Users/nfrunza/workspace/gerrit/blockchain-explorer/node_modules/grpc/src/client.js:64:15)
        at /Users/nfrunza/workspace/gerrit/blockchain-explorer/node_modules/grpc/src/client.js:583:15
      code: 12,
      metadata: Metadata { _internal_repr: {} },
      details: 'unknown service discovery.Discovery' }
    Received kill signal, shutting down gracefully


#### Possible cause:
    Fabric version not supported, this could be you’re connecting to HLFabric 1.1
#### Possible solution:
    Configure connection to HL Fabric 1.2,  by updating blockchain-explorer/app/platform/fabric/config.json, see instructions provided in README, search for “## Fabric Configure Hyperledger Explorer”

#### Related Information:
    HL Explorer support for HL Fabric 1.2


### Problem Description:  HL Explorer fails to start

#### Background Information:
    Received kill signal, shutting down gracefully
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing explorer  >>>>>>>>>>>>>>>>>>    >>>
    Closed out connections
    <<<<<<<<<<<<<<<<<<<<<<<<<< Closing client processor >>>>>>>>>>>>>>>>>>>>>

#### Possible cause:
    Another node process may run
#### Possible solution:
    Issue command $pkill node

#### Related Information:
    HL Explorer support for HL Fabric 1.2
    
### Docker Troubleshooting commands
    List your networks
    $docker network ls
    List docker images id
    $docker images | grep block
    Remove an image
    $docker rmi <image_id>
    Login to docker
    $docker exec -it <image_id> sh
    Read explorer app log
    $docker exec <image_id> cat /opt/logs/app/app.log
    Inspect real IP's
    $docker inspect <image_id> | grep IPAddress
    Stop and remove dockers
    $docker stop $(docker ps -a -q)
    $docker rm -f $(docker ps -a -q)
    Remove default fabric crypto
    $rm -rf ./crypto-config/*
    $rm -rf ~/.hfc*
    From the docker ($docker exec -it <image_id> sh)
    Install curl:
    $apk update && apk add curl
    Use curl in docker to query explorer REST API
    Example:
    $curl http://localhost:8080/api/channels
    Example response: {"status":200,"channels":["dockerchannel","mychannel"]






