#!/bin/bash

# SPDX-License-Identifier: Apache-2.0
ROOTDIR=${EXPLORERROOT:-../../../../..}

echo "Copying ENV variables into temp file..."
node processenv.js
if [ $( jq .DATABASE_USERNAME /tmp/process.env.json) == null ]; then
  export USER=$( jq .postgreSQL.username ${ROOTDIR}/app/explorerconfig.json )
else
  export USER=$( jq .DATABASE_USERNAME /tmp/process.env.json)
fi
if [ $(jq .DATABASE_DATABASE /tmp/process.env.json) == null ]; then
  export DATABASE_PREFIX=$(jq -r .postgreSQL.databasePrefix ${ROOTDIR}/app/explorerconfig.json )
else
  export DATABASE_PREFIX=$(jq -r .DATABASE_DATABASE /tmp/process.env.json)
fi
if [ $(jq .DATABASE_PASSWORD /tmp/process.env.json) == null ]; then
  export PASSWD=$(jq .postgreSQL.passwd ${ROOTDIR}/app/explorerconfig.json | sed "y/\"/'/")
else
  export PASSWD=$(jq .DATABASE_PASSWORD /tmp/process.env.json |  sed "y/\"/'/")
fi

if [ -f /tmp/process.env.json ] ; then
    rm /tmp/process.env.json
fi

for network_name in $(jq '.["network-configs"]' ${ROOTDIR}/app/platform/fabric/config.json | jq keys | jq -r .[]); do
  echo $network_name | grep -E "^[0-9a-z_]+$" >/dev/null
  if [ $? -eq 1 ]; then
    echo 'Explorer uses network name to create db name. Please specify each network name using digits, lower characters and underscores.'
    exit 1;
  fi
  # export DATABASE=$(echo ${DATABASE_PREFIX} | sed -e 's/"//g')_$(echo ${network_name}|sed -e 's/-/_/g')
  export DATABASE=$(echo ${DATABASE_PREFIX}_${network_name})

  echo "USER=${USER}"
  echo "DATABASE=${DATABASE}"
  echo "PASSWD=${PASSWD}"
  echo "Executing SQL scripts, OS="$OSTYPE

  #support for OS
  case $OSTYPE in
  darwin*) psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
  psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
  linux*)
  if [ $(id -un) = 'postgres' ]; then
    PSQL="psql"
  else
    PSQL="sudo -u postgres psql"
  fi;
  ${PSQL} -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
  ${PSQL} -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
  esac
done



