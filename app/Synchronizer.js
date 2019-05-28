/*
    SPDX-License-Identifier: Apache-2.0
*/

const syncconfig = require('./explorerconfig.json');
const ExplorerError = require('./common/ExplorerError');

const SyncBuilder = require('./sync/SyncBuilder');
const PersistenceFactory = require('./persistence/PersistenceFactory');
const ExplorerSender = require('./sync/sender/ExplorerSender');

const explorer_const = require('./common/ExplorerConst').explorer.const;
const explorer_error = require('./common/ExplorerMessage').explorer.error;

class Synchronizer {
  constructor(args) {
    this.args = args;
    this.persistence = null;
    this.platform = null;
  }

  async initialize() {
    if (!syncconfig[explorer_const.PERSISTENCE]) {
      throw new ExplorerError(explorer_error.ERROR_1001);
    }
    if (!syncconfig[syncconfig[explorer_const.PERSISTENCE]]) {
      throw new ExplorerError(
        explorer_error.ERROR_1002,
        syncconfig[explorer_const.PERSISTENCE]
      );
    }

    let pltfrm;
    if (syncconfig && syncconfig.sync && syncconfig.sync.platform) {
      pltfrm = syncconfig.sync.platform;
    } else {
      throw new ExplorerError(explorer_error.ERROR_1006);
    }

    // if (!this.args || this.args.length == 0) {
    // throw new ExplorerError(explorer_error.ERROR_1007);
    // }

    if (
      !(this.args && this.args.length > 2 && this.args[2] === '1') &&
      syncconfig.sync.type !== explorer_const.SYNC_TYPE_HOST
    ) {
      throw new ExplorerError(explorer_error.ERROR_1008);
    }

    this.persistence = await PersistenceFactory.create(
      syncconfig[explorer_const.PERSISTENCE],
      syncconfig[syncconfig[explorer_const.PERSISTENCE]]
    );

    const sender = new ExplorerSender(syncconfig.sync);
    sender.initialize();

    this.platform = await SyncBuilder.build(pltfrm, this.persistence, sender);

    this.platform.setPersistenceService();

    this.platform.setBlocksSyncTime(syncconfig.sync.blocksSyncTime);

    await this.platform.initialize(this.args);
  }

  close() {
    if (this.persistence) {
      // this.persistence.closeconnection();
    }
    if (this.platform) {
      this.platform.destroy();
    }
  }
}

module.exports = Synchronizer;
