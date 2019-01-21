#!/bin/bash

if [ $(whoami) != 'postgres' ]; then
  echo "You need to call as postgres user. sudo -u postgres $0"
  exit 1
fi

echo "Copying ENV variables into temp file..."
node processenv.js
if [ $( jq .DATABASE_USERNAME /tmp/process.env.json) == null ]; then
  export USER=$( jq .postgreSQL.username ../../../../explorerconfig.json )
else
  export USER=$( jq .DATABASE_USERNAME /tmp/process.env.json)
fi
if [ $(jq .DATABASE_DATABASE /tmp/process.env.json) == null ]; then
  export DATABASE=$(jq .postgreSQL.database ../../../../explorerconfig.json )
else
  export DATABASE=$(jq .DATABASE_DATABASE /tmp/process.env.json)
fi
if [ $(jq .DATABASE_PASSWORD /tmp/process.env.json) == null ]; then
  export PASSWD=$(jq .postgreSQL.passwd ../../../../explorerconfig.json | sed "y/\"/'/")
else
  export PASSWD=$(jq .DATABASE_PASSWORD /tmp/process.env.json |  sed "y/\"/'/")
fi
echo "USER=${USER}"
echo "DATABASE=${DATABASE}"
echo "PASSWD=${PASSWD}"
if [ -f /tmp/process.env.json ] ; then
    rm /tmp/process.env.json
fi
echo "Executing SQL scripts..."
case $OSTYPE in
darwin*) psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
linux*) psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
esac


