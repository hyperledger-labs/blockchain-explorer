
export USER=$( jq .pg.username pgconfig.json )
export DATABASE=$( jq .pg.database pgconfig.json  )
export PASSWD=$( jq .pg.passwd pgconfig.json | sed "y/\"/'/")
 case $OSTYPE in
 darwin*) psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 psql postgres -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
 linux*) sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./explorerpg.sql ;
 sudo -u postgres psql -v dbname=$DATABASE -v user=$USER -v passwd=$PASSWD -f ./updatepg.sql ;;
 esac