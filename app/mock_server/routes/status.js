/*
    SPDX-License-Identifier: Apache-2.0
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getStatus(req, res) {
    let idx = getRandomInt(1, 3);
    let data = require('../../mock_server/mockData/apistatusget' + idx + '.json')
    res.set('Content-Type', 'application/json');
    res.send(data);
}

module.exports = { getStatus };