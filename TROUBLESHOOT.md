## Troubleshooting TechNotes - Hyperledger Explorer

#### Problem Description: Hyperledger explorer application fails to start

##### Background Information
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

##### Possible cause:
* Another node process is running
##### Possible solution:
    $pkill node
* Before killing the node , check that same port is running `“ps -ef | grep node”` if yes kill the particular port “ kill -9 ‘number’” . if no change the port in config.json
Related Information:

#### Problem Description: Hypeledger Explorer fails to start, ENOENT: no such file or directory, scandir

##### Background Information
    postgres://hppoc:password@127.0.0.1:5432/fabricexplorer
    fs.js:904
    return binding.readdir(pathModule._makeLong(path), options.encoding);
                     ^

    Error: ENOENT: no such file or directory, scandir 'fabric-path/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore'
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


##### Possible cause:
* No fabric network configured
##### Possible solution:
	*update config.json “fabric-path/” with the path to your fabric network
##### Related Information:


#### Problem Description: Hyperledger Explorer fails to run, Client has already been connected. You cannot reuse a client.

##### Background Information
    error when connecting to db: Error: Client has already been connected. You cannot reuse a client.
        at Client.connect (/Users/USER_ID/workspace/blockchain-explorer/node_modules/pg/lib/client.js:59:17)
        at Timeout.handleDisconnect [as _onTimeout] (/Users/USER_ID/workspace/blockchain-explorer/app/db/pgservice.js:34:12)
        at ontimeout (timers.js:498:11)
        at tryOnTimeout (timers.js:323:5)
        at Timer.listOnTimeout (timers.js:290:5)

##### Possible cause:
* No database schema defined
##### Possible solution:
	* Follow up README.md document database setup instructions
            ## Database setup

##### Related Information:

#### Problem Description: No postgres service available

##### Background Information
    Niks-MacBook-Pro:blockchain-explorer USER_ID$ sudo -u postgres psql
    sudo: unknown user: postgres
    sudo: unable to initialize policy plugin

#####Possible cause:
* No postgres service running
##### Possible solution:
* Verify if postgresql service is running, and you can run command
`psql postgres`

* To see the port postgresql is running, run from `postgres=#`

    `SELECT * FROM pg_settings WHERE name = 'port';`



##### Related Information:

##### Problem Information
 * Hyperledger Explorer failed to start, EADDRINUSE :::8080

#### Problem Description : Another node process may run

##### Background Information
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

##### Possible solution
     * Terminate node process, issue command: $ pkill node

##### Related Information:

###### Problem Information
 * Hyperledger Explorer failed to start, column "channel_hash" of relation "channel" does not exist

#### Problem Description: Postgresql schema updates needed

##### Background Information
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

##### Possible Solution

 * Follow up on “Database Setup”, stop node process, $ pkill node, then


 * Start hyperledger explorer ./start.sh from root directory


#### Problem Description:  Hyperledger explorer application fails to start, UNAVAILABLE: Connect Failed

##### Background Information
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

##### Possible cause:
No fabric network detected based on the explorer configuration
##### Possible solution:
	* Verify if fabric network is running
Related Information:

