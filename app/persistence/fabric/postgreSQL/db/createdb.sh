#!/bin/bash

#if [ $(whoami) != 'postgres' ]; then
#  echo "You need to call as postgres user. sudo -u postgres $0"
#  exit 1
#fi

echo "Copying ENV variables into temp file..." > /tmp/createdb.log
[[ "$DOCKER_ENTRYPOINT_INIT" == true ]] && node /opt/processenv.js >> /tmp/createdb.log || node processenv.js >> /tmp/createdb.log
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
echo "USER=${USER}" >> /tmp/createdb.log
echo "DATABASE=${DATABASE}" >> /tmp/createdb.log
echo "PASSWD=${PASSWD}" >> /tmp/createdb.log
if [ -f /tmp/process.env.json ] ; then
    rm /tmp/process.env.json >> /tmp/createdb.log
fi
echo "Executing SQL scripts..." >> /tmp/createdb.log
case $OSTYPE in
darwin*) psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql >> /tmp/createdb.log ;
psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql >> /tmp/createdb.log ;;
linux*) psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql >> /tmp/createdb.log ;
psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql >> /tmp/createdb.log ;;
esac


