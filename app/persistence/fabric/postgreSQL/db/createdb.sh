
export USER=$( jq .postgreSQL.username ../../../../explorerconfig.json )
export DATABASE=$( jq .postgreSQL.database ../../../../explorerconfig.json  )
export PASSWD=$( jq .postgreSQL.passwd ../../../../explorerconfig.json | sed "y/\"/'/")
 case $OSTYPE in
 darwin*) psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
 linux*) sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
 esac