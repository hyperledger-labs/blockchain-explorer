#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash
#
#Redirecting console.log to log file.
#Please visit ./logs/app to view the application logs and visit the ./logs/db to view the Database logs and visit the ./log/console for the console.log
# Log rotating for every 7 days.

echo "************************************************************************************"
echo "**************************** Hyperledger Explorer **********************************"
echo "************************************************************************************"

export LOG_LEVEL_APP=${LOG_LEVEL_APP:-debug}
export LOG_LEVEL_DB=${LOG_LEVEL_DB:-debug}
export LOG_LEVEL_CONSOLE=${LOG_LEVEL_CONSOLE:-info}
export LOG_CONSOLE_STDOUT=${LOG_CONSOLE_STDOUT:-false}

export DISCOVERY_AS_LOCALHOST=${DISCOVERY_AS_LOCALHOST:-true}
export EXPLORER_APP_ROOT=${EXPLORER_APP_ROOT:-dist}
export PORT=${PORT:-8080}

log_exit() {
  echo "Server stopped"
  exit
}
trap log_exit INT EXIT
echo "Server running..."

node ${EXPLORER_APP_ROOT}/main.js name - hyperledger-explorer
