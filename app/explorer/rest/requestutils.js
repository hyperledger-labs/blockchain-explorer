/*
    SPDX-License-Identifier: Apache-2.0
*/

function invalidRequest(req, res) {
    let payload = reqPayload(req);
    res.send({
        status: 400,
        error: "BAD REQUEST",
        "payload": payload
    })
}

function notFound(req, res) {
    let payload = reqPayload(req);
    res.send({
        status: 404,
        error: "NOT FOUND",
        "payload": payload
    })
}

function reqPayload(req) {
    let reqPayload = {};
    if (req.query) {
        reqPayload = req.query
    } else if (req.body) {
        reqPayload = req.body
    }
    else if (req.params) {
        reqPayload = req.params
    }
    return reqPayload;
}

module.exports = { invalidRequest, notFound, reqPayload };