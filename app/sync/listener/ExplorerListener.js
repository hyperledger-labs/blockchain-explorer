/*
    SPDX-License-Identifier: Apache-2.0
*/
var explorer_const = require('../../common/ExplorerConst').explorer.const;

class ExplorerListener {

    constructor(platform, syncconfig) {
        this.platform = platform;
        this.syncType = syncconfig.type;
        this.syncListenerHandler;
    }

    async initialize(args) {
        if (this.syncType && this.syncType === explorer_const.SYNC_TYPE_LOCAL) {
            let ForkListenerHandler = require('./ForkListenerHandler');
            this.syncListenerHandler = new ForkListenerHandler(this.platform);
        }
        if (this.syncListenerHandler) {
            this.syncListenerHandler.initialize(args);
        }
    }

    send(message) {
        if (this.syncListenerHandler) {
            this.syncListenerHandler.send({
                message: message
            });
        }
    }

    close() {
        if (this.syncListenerHandler) {
            this.syncListenerHandler.close();
        }
    }
}

module.exports = ExplorerListener;