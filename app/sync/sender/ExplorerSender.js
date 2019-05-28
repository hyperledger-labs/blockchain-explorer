/*
    SPDX-License-Identifier: Apache-2.0
*/

const ForkSenderHandler = require('./ForkSenderHandler');
const explorer_const = require('../../common/ExplorerConst').explorer.const;

class ExplorerSender {
  constructor(syncconfig) {
    this.syncType = syncconfig.type;
    this.syncSenderHandler = null;
  }

  async initialize() {
    if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
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
}

module.exports = ExplorerSender;
