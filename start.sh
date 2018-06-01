#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash

rm -rf /tmp/fabric-client-kvs_Org*
sed -i -- 's@\/opt\/gopath@'"$GOPATH"'@g' config.json

node main.js
