#!/usr/bin/env bash

if [[ -z "${DATABASE_USERNAME}" ]]; then
  USER=$( jq .pg.username pgconfig.json )
else
  USER=$DATABASE_USERNAME
fi
if [[ -z "${DATABASE_DATABASE}" ]]; then
  DATABASE=$( jq .pg.database pgconfig.json )
else
  DATABASE=$DATABASE_DATABASE
fi
if [[ -z "${DATABASE_PASSWORD}" ]]; then
  PASSWD=$(jq .pg.passwd pgconfig.json | sed "y/\"/'/")
else
  PASSWD=$DATABASE_PASSWORD
fi

echo "USER=${USER}"
echo "DATABASE=${DATABASE}"
echo "PASSWD=${PASSWD}"

case $OSTYPE in
 darwin*) echo "Creating Default user $USER..." ;
 psql -U postgres -c "CREATE USER $USER WITH PASSWORD '$PASSWD'" ;
 psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
 linux*) echo "Creating Default user..." ;
 sudo -u postgres psql -U postgres -c "CREATE USER $USER WITH PASSWORD '$PASSWD'" ;
 sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
esac