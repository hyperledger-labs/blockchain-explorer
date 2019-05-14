#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash
#
#Redirecting console.log to log file.
#Please visit ./logs/sync/app to view the application logs and visit the ./logs/sync/db to view the Database logs and visit the ./log/console for the console.log
# Log rotating for every 7 days.

rm -rf /tmp/fabric-client-kvs_peerOrg*

export SYNC_LOG_PATH=./logs/sync

mkdir -p $SYNC_LOG_PATH/app & mkdir -p $SYNC_LOG_PATH/db & mkdir -p $SYNC_LOG_PATH/console

SYNC_LOG_CONSOLE_PATH="$SYNC_LOG_PATH/console/console-$(date +%Y-%m-%d).log"

echo "************************************************************************************"
echo "**************************** Hyperledger Explorer Sync**********************************"
echo "************************************************************************************"
echo "***** Please check the log [$SYNC_LOG_CONSOLE_PATH] for any error *****"
echo "************************************************************************************"

node sync.js $1 $2 >>$SYNC_LOG_CONSOLE_PATH 2>&1 &

find $SYNC_LOG_PATH/app -mtime +7 -type f -delete & find $SYNC_LOG_PATH/db -mtime +7 -type f -delete & find $SYNC_LOG_PATH/console -mtime +7 -type f -delete



