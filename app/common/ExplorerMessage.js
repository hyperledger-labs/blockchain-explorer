/*
    SPDX-License-Identifier: Apache-2.0
*/
'use strict';

exports.explorer = {
  error: {
    // Generic Error message
    ERROR_1001:
      'Missing persistence type property [persistence] in explorerconfig.json',
    ERROR_1002:
      'Missing database configuration property [%s] in explorerconfig.json',
    ERROR_1003: 'Persistence implementation is not found for %s',
    ERROR_1004: 'Platform implimenation is not found for %s',
    ERROR_1005: 'Platform implimenation is not found for synch process %s',
    ERROR_1006: 'Platform type is not found in syncconfig or argument',
    ERROR_1007:
      'Missing network_name and client_name , Please run as > sync.js network_name client_name',
    ERROR_1008:
      'Sync type is set as [local] hence independent sync process cannot be started. Please change the sync type to [host] and restart explorer',
    ERROR_1009:
      'Failed to connect client peer, please check the configuration and peer status',

    // Fabric Error message
    ERROR_2001:
      'Default defined channel %s is not found for the client %s peer',
    ERROR_2002:
      'There are no orderers defined on this channel in the network configuration',
    ERROR_2003:
      'Default client peer is down and no channel details available database',
    ERROR_2004: 'Default channel is not available in database',
    ERROR_2005: 'Default peer is not available in database',
    ERROR_2006: 'Default peer is not added in the client %s',
    ERROR_2007: 'No TLS cert information available',
    ERROR_2008: 'There is no client found for Hyperledger fabric platform',
    ERROR_2009:
      'Explorer is closing due to channel name [%s] is already exist in DB',
    ERROR_2010: 'Client Processor Error >> %s',
    ERROR_2011: 'There is no client found for Hyperledger fabric scanner',
    ERROR_2013:
      'Channel name [%s] already exist in DB , Kindly re-run the DB scripts to proceed',
    ERROR_2014: 'Invalid platform configuration, Please check the log'
  },
  message: {
    // Generic Message
    MESSAGE_1001: 'Explorer will continue working with only DB data',
    MESSAGE_1002:
      'Sync process is started for the network : [%s] and client : [%s]'

    // Fabric Message
  }
};
