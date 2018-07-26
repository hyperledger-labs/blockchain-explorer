/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var express = require('express');
var bodyParser = require('body-parser');
var dbroutes = require('./rest/dbroutes.js');
var platformroutes = require('./rest/platformroutes.js');
var explorerconfig = require('./explorerconfig.json');
var PersistenceFactory = require('../persistence/PersistenceFactory.js');
var timer = require('./backend/timer.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');
var compression = require('compression');

class Explorer {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
    this.app.use(compression());
    this.persistence = {};
    this.platforms = explorerconfig['platforms'];
  }

  getApp() {
    return this.app;
  }

  async initialize(broadcaster) {
    this.persistence = await PersistenceFactory.create(
      explorerconfig['persistence']
    );
    dbroutes(this.app, this.persistence);
    for (let pltfrm of this.platforms) {
      await platformroutes(this.app, pltfrm, this.persistence);
      timer.start(platform, this.persistence, broadcaster);
    }
  }

  close() {
    if (this.persistence) {
      this.persistence.closeconnection();
    }
  }
}

module.exports = Explorer;
