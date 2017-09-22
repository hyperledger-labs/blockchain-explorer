#!/bin/bash

rm -rf /tmp/fabric-client-kvs_peerOrg*

node main.js >log.log 2>&1 &
