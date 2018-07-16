/*
*SPDX-License-Identifier: Apache-2.0
*/



class PlatformBuilder {

    static async build(app, pltfrm, persistence, broadcaster) {
        try {
            if (pltfrm == 'fabric') {
                var Platform = require('./fabric/Platform_1.2.0');
                var platform = new Platform(app, persistence, broadcaster);
                await platform.initialize();
                return platform;
            }
        } catch (e) {
            console.log(e);
        }

        throw ("Platform implimenation is not found for " + pltfrm);
    }
}

module.exports = PlatformBuilder;
