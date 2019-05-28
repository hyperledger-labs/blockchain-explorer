/*
    SPDX-License-Identifier: Apache-2.0
*/

const helper = require('../../common/helper');

const logger = helper.getLogger('Proxy');

class ForkSenderHandler {
  async initialize() {
    process.on('message', msg => {
      logger.debug('Message from parent: %j', msg);
    });
  }

  send(message) {
    if (process.send) {
      process.send(message);
    }
  }

  close() {}
}

module.exports = ForkSenderHandler;
