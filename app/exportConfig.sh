#!/bin/bash

echo "should be sourced"
jq . ./explorerconfig.json >/dev/null

export DATABASE_HOST=$(jq -r '.postgreSQL.host' ./explorerconfig.json)
export DATABASE_PORT=$(jq -r '.postgreSQL.port' ./explorerconfig.json)
export DATABASE_USERNAME=$(jq -r '.postgreSQL.username' ./explorerconfig.json)
export DATABASE_DATABASE=$(jq -r '.postgreSQL.database' ./explorerconfig.json)
export DATABASE_PASSWD=$(jq -r '.postgreSQL.passwd' ./explorerconfig.json)
