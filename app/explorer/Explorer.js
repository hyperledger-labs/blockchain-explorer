var express = require("express");
var bodyParser = require("body-parser");
var dbroutes = require("./rest/dbroutes");
var platformroutes = require("./rest/platformroutes");
var explorerconfig = require("./explorerconfig.json");
var PersistanceFactory = require("../persistance/PersistanceFactory.js");
var timer = require("./backend/timer.js");


class Explorer {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.persistance = {};
        this.platforms = explorerconfig["platforms"];

    }

    getApp() {
        return this.app;
    }

    async initialize() {

        this.persistance = await PersistanceFactory.create(explorerconfig["persistance"]);
        dbroutes(this.app, this.persistance);
        for (let pltfrm of this.platforms) {
          await platformroutes(this.app, pltfrm, this.persistance);
          timer.start(platform, this.persistance);
        }
    }
}

module.exports = Explorer;