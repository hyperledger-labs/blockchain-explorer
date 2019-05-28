/*
    SPDX-License-Identifier: Apache-2.0
*/

const ForkListenerHandler = require('./ForkListenerHandler');
const explorer_const = require('../../common/ExplorerConst').explorer.const;

class ExplorerListener {
  constructor(platform, syncconfig) {
    this.platform = platform;
    this.syncType = syncconfig.type;
    this.syncListenerHandler = null;
  }

  async initialize(args) {
    if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
      this.syncListenerHandler = new ForkListenerHandler(this.platform);
    }
    if (this.syncListenerHandler) {
      this.syncListenerHandler.initialize(args);
    }
  }

  send(message) {
    if (this.syncListenerHandler) {
      this.syncListenerHandler.send({ message });
    }
  }

  close() {
    if (this.syncListenerHandler) {
      this.syncListenerHandler.close();
    }
  }
}

module.exports = ExplorerListener;
