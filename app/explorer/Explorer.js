/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var express = require("express");
var bodyParser = require("body-parser");
var dbroutes = require("./rest/dbroutes.js");
var platformroutes = require("./rest/platformroutes.js");
var explorerconfig = require("./explorerconfig.json");
var PersistanceFactory = require("../persistance/PersistanceFactory.js");
var timer = require("./backend/timer.js");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

class Explorer {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.persistance = {};
        this.platforms = explorerconfig["platforms"];

    }

    getApp() {
        return this.app;
    }

    async initialize(broadcaster) {

        this.persistance = await PersistanceFactory.create(explorerconfig["persistance"]);
        dbroutes(this.app, this.persistance);
        for (let pltfrm of this.platforms) {
          await platformroutes(this.app, pltfrm, this.persistance);
          timer.start(platform, this.persistance, broadcaster);
        }
    }
}

module.exports = Explorer;