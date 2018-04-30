/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux'
import peerList from './peerList.js'
import channelList from './channelList.js'
import blockList  from './blockList.js'
import transactionList  from './transactionList'
import countHeader from './countHeader.js'
import channel from './channel';
import block from './block';
import transaction from './transaction';
import blockPerMin from './blockPerMin';
import blockPerHour from './blockPerHour';
import txPerMin from './txPerMin';
import txPerHour from './txPerHour';
import chaincodes from './chaincodes';
import notification from './notification';
import txByOrg from './txByOrg';
export default combineReducers({
    peerList,
    channelList,
    countHeader,
    blockList,
    channel,
    transactionList,
    block,
    transaction,
    blockPerMin,
    blockPerHour,
    txPerMin,
    txPerHour,
    chaincodes,
    notification,
    txByOrg
})