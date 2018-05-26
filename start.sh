#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash

rm -rf /tmp/fabric-client-kvs_peerOrg*

node main.js >log.txt 2>&1 &
