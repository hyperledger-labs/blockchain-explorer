/*
    SPDX-License-Identifier: Apache-2.0
*/

var path = require('path');
var fs = require('fs');

var generateDir = async function () {
    var tempDir = '/tmp/' + new Date().getTime();
    try {
        fs.mkdirSync(tempDir);
    } catch (err) {
        logger.error(err);
    }
    return tempDir
}


exports.generateDir = generateDir