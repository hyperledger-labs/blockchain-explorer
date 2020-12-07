#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash

# Please visit ./logs/sync/app to view the application logs and visit the ./logs/sync/db to view the Database logs and visit the ./logs/sync/console for the console.log
# Log rotating for every 7 days.

export SYNC_LOG_PATH=./logs/sync

echo "************************************************************************************"
echo "**************************** Hyperledger Explorer Sync**********************************"
echo "************************************************************************************"

export LOG_LEVEL_APP=${LOG_LEVEL_APP:-debug}
export LOG_LEVEL_DB=${LOG_LEVEL_DB:-debug}
export LOG_LEVEL_CONSOLE=${LOG_LEVEL_CONSOLE:-info}
export LOG_CONSOLE_STDOUT=${LOG_CONSOLE_STDOUT:-false}

export DISCOVERY_AS_LOCALHOST=${DISCOVERY_AS_LOCALHOST:-true}
export EXPLORER_APP_ROOT=${EXPLORER_APP_ROOT:-dist}

node ${EXPLORER_APP_ROOT}/sync.js $1 $2 &
