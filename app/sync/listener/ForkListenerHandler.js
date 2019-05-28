/*
    SPDX-License-Identifier: Apache-2.0
*/

const path = require('path');
const { fork } = require('child_process');

class ForkListenerHandler {
  constructor(platform) {
    this.platform = platform;
    this.syncProcessor = null;
  }

  async initialize(args) {
    const _self = this;

    this.syncProcessor = fork(
      path.resolve(__dirname, '../../../sync.js'),
      args
    );

    this.syncProcessor.on('message', msg => {
      _self.platform.getProxy().processSyncMessage(msg);
    });
  }

  send(message) {
    this.syncProcessor.send({ message });
  }

  close() {
    if (this.syncProcessor) {
      this.syncProcessor.kill('SIGINT');
    }
  }
}

module.exports = ForkListenerHandler;
