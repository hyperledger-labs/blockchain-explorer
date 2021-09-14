#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#

EXPLORER_PROCESS_ID=$(ps -eo pid,args | grep -v "awk" | awk '/name - hyperledger-explorer/ {print $1}')

if [ $EXPLORER_PROCESS_ID > 0 ]
then
    echo 'Stopping node process hyperledger-explorer, id ' $EXPLORER_PROCESS_ID
    kill -SIGTERM $EXPLORER_PROCESS_ID
else
    echo 'No process name hyperledger-explorer found'
fi

