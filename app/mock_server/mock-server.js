/*
    SPDX-License-Identifier: Apache-2.0
*/

var express = require("express");
var path = require('path');
var app = express();
var http = require('http').Server(app);
var router = express.Router();
var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, './client/build')));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

var config = require('../../../config.json');
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;

var status = require('./routes/status');

//  curl -i 'http://localhost:8080/api/status/mychannel'
router.get('/api/status/:channel', function (req, res) {
    status.getStatus(req, res)
});


app.use('/', router);

app.listen(port, function () {
    console.log(`Please open Internet explorer to access ：http://${host}:${port}/`);
});

module.exports = app; // for testing

