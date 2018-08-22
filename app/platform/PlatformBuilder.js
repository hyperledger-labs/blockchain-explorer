/*
*SPDX-License-Identifier: Apache-2.0
*/

var Platform = require('./fabric/Platform.js');

class PlatformBuilder {
  static async build(pltfrm) {
    if (pltfrm == 'fabric') {
      var platform = new Platform();
      await platform.initialize();
      return platform;
    }

    throw 'Invalid Platform';
  }
}

module.exports = PlatformBuilder;
