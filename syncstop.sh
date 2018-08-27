#
#    SPDX-License-Identifier: Apache-2.0
#

kill -SIGTERM $(ps aux  |  grep 'sync.js' |  grep -v grep | awk '{print $2}')



