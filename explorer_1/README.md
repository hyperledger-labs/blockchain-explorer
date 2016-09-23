#Hyperledger Explorer
This is the initial release of the Hyperledger explorer which provides a User Interface to explore and examine the current state of the Hyperledger blockchain in a convenient and easy to use manner. Similar to bitcoin explorers or crypto-currency explorers, information such as transaction information, network activity, recent blocks, visuals and search etc. are available that allows for information to be quickly found.

Follow the following installation steps:
```
npm install npm bower grunt-cli graceful-fs@4.1.5 minimatch@3.0.2 -g
npm install grunt grunt-auto-install grunt-contrib-uglify grunt-contrib-copy
grunt
```

The explorer relies on the current gRPC rest APIs that are available. To run the explorer make sure that at least one validating peer is running. Please refer to documentation at http://hyperledger-fabric.readthedocs.io/en/latest/Setup/Network-setup/.

Retrieve the REST URL from peer setup and select a port for webserver. 9090 is default http port the http server listens for requests specified by environment variable 9090. http://127.0.0.1:7050 is the default REST end point for hyperledger REST requests. The REST requests currently used are `/chain`, `/network/peers` and `/chain/blocks/:blockNum`.

To run the explorer webserver, on UNIX platforms:
```
HTTP_PORT=<web server port. Default is 9090 if not set> HYP_REST_ENDPOINT=<REST endpoint. Default is http://127.0.0.1:7050 if not set> node exp-server.js
```

On Windows:
```
set HTTP_PORT=<web server port. Default is 9090 if not set>
set HYP_REST_ENDPOINT=<REST endpoint. Default is http://127.0.0.1:7050 if not set>
node exp-server.js
```
