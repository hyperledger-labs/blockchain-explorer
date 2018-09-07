/*
    SPDX-License-Identifier: Apache-2.0
*/
'use strict';
var explorer_const = require('../../common/ExplorerConst').explorer.const;

class ExplorerSender {

  constructor(syncconfig) {
    this.syncType = syncconfig.type;
    this.syncSenderHandler;
  }

  async initialize() {
    if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
      let ForkSenderHandler = require('./ForkSenderHandler');
      this.syncSenderHandler = new ForkSenderHandler();
    }
    if (this.syncSenderHandler) {
      this.syncSenderHandler.initialize();
    }
  }

  send(message) {
    if (this.syncSenderHandler) {
      this.syncSenderHandler.send(message);
    }
  }

  close() {
    if (this.syncSenderHandler) {

    }
  }
}

module.exports = ExplorerSender;
