/*
*SPDX-License-Identifier: Apache-2.0
*/

var explorer_const = require('../common/ExplorerConst').explorer.const;
var explorer_error = require('../common/ExplorerMessage').explorer.error;
var ExplorerError = require('../common/ExplorerError');

class PlatformBuilder {

  static async build(pltfrm, persistence, broadcaster) {

    if (pltfrm === explorer_const.PLATFORM_FABRIC) {
      let Platform = require('./fabric/Platform');
      var platform = new Platform(persistence, broadcaster);
      return platform;
    }
    throw new ExplorerError(explorer_error.ERROR_1004, pltfrm);
  }
}

module.exports = PlatformBuilder;
