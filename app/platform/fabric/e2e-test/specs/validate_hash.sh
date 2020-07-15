#!/bin/bash

channel=commonchannel
while getopts "c:" opt; do
  case "$opt" in
  c)
    channel=$OPTARG
    ;;
  esac
done

docker exec explorerdb.mynetwork.com \
psql -t -U postgres fabricexplorer -c \
"select array_to_json(array_agg(row_to_json(t)))
  from (
    select blocks.blocknum, blocks.prehash, blocks.blockhash from blocks
    join channel on blocks.channel_genesis_hash = channel.channel_genesis_hash
    where channel.name='${channel}'
    order by blocknum
  ) t" > result.json

length=$(jq 'length' result.json)
i=0
while [ $i -lt $(expr $length - 1) ]; do
  current=$i
  i=$(expr $i + 1)
  next=$i
  bh=$(jq '.['$current'].blockhash' result.json)
  ph=$(jq '.['$next'].prehash' result.json)
  echo $bh
  echo $ph
  if [ $bh != $ph ]; then
    echo "FAIL... Invalid blockhash chain : $(jq '.['$current'].blocknum' result.json)"
    exit 1
  fi
done

echo 'PASS!!! Valid blockhash chain'
exit 0

