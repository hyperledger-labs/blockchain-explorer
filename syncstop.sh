#
#    SPDX-License-Identifier: Apache-2.0
#

kill -15 $(ps aux  |  grep 'sync.js' |  grep -v grep | awk '{print $2}')



