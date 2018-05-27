/*
*SPDX-License-Identifier: Apache-2.0
*/

var FabricPlatform = require('./fabric/FabricPlatform.js');

class PlatformBuilder {

    static async build(platform) {

        var platform;

        if(platform == 'fabric') {
            var platform = new FabricPlatform();
            await platform.initialize();
            return platform;
        }

        throw("Invalid Platform");
    }
}

module.exports = PlatformBuilder;
