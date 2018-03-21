/*
    SPDX-License-Identifier: Apache-2.0
*/

var helper = require('../helper.js');
var logger = helper.getLogger('requestutils');

function invalidRequest(req, res) {
    logger.error("BAD REQUEST", ", payload:", req.query)
    res.send({
        status: 400,
        error: "BAD REQUEST",
        "payload": req.params
    })
}

function notFound(req, res) {
    res.send({
        status: 404,
        error: "NOT FOUND",
        "payload": req.params
    })
}

module.exports = { invalidRequest, notFound };